#include "Microtransaction.h"
#include "HttpModule.h"
#include "Interfaces/IHttpRequest.h"
#include "JsonUtilities.h"
#include "OnlineSubsystem.h"
#include "OnlineSubsystemSteam.h"

AMicrotransaction::AMicrotransaction()
{
    PrimaryActorTick.bCanEverTick = true;
    CurrentOrder = FMath::RandRange(1000000, 100000000);
    CurrentCoins = 100;
    bIsInPurchaseProcess = false;
}

void AMicrotransaction::BeginPlay()
{
    Super::BeginPlay();
    // Bind the Steamworks callback
    IOnlineSubsystem* OnlineSubsystem = IOnlineSubsystem::Get();
    if (OnlineSubsystem && OnlineSubsystem->GetSubsystemName() == STEAM_SUBSYSTEM)
    {
        IOnlineIdentityPtr IdentityInterface = OnlineSubsystem->GetIdentityInterface();
        IOnlineStorePtr StoreInterface = OnlineSubsystem->GetStoreInterface();
        if (IdentityInterface.IsValid() && StoreInterface.IsValid())
        {
            StoreInterface->OnMicroTxnAuthorizationResponse().AddUObject(this, &AMicrotransaction::OnMicroTxnAuthorizationResponse);
            UE_LOG(LogTemp, Log, TEXT("Steamworks callback bound successfully."));
        }
    }
}

void AMicrotransaction::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
}

void AMicrotransaction::InitializePurchase()
{
    FString UserId;
    IOnlineSubsystem* OnlineSubsystem = IOnlineSubsystem::Get();
    if (OnlineSubsystem && OnlineSubsystem->GetSubsystemName() == STEAM_SUBSYSTEM)
    {
        IOnlineIdentityPtr IdentityInterface = OnlineSubsystem->GetIdentityInterface();
        if (IdentityInterface.IsValid())
        {
            TSharedPtr<const FUniqueNetId> UserIdPtr = IdentityInterface->GetUniquePlayerId(0);
            if (UserIdPtr.IsValid())
            {
                UserId = UserIdPtr->ToString();
            }
        }
    }

    TSharedRef<FJsonObject> RequestData = MakeShared<FJsonObject>();
    RequestData->SetStringField("itemId", "1001");
    RequestData->SetStringField("steamId", UserId);
    RequestData->SetStringField("orderId", FString::FromInt(CurrentOrder));
    RequestData->SetStringField("itemDescription", "1000 Coins");
    RequestData->SetStringField("category", "Gold");
    RequestData->SetStringField("appId", AppId);

    MakeApiCall(BaseUrl + "/InitPurchase", RequestData, [this](FHttpResponsePtr Response, bool bSuccess)
    {
        if (!bSuccess || !Response.IsValid())
        {
            UE_LOG(LogTemp, Error, TEXT("Error initializing purchase: %s"), *Response->GetContentAsString());
            return;
        }

        TSharedPtr<FJsonObject> JsonResponse;
        TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Response->GetContentAsString());
        if (FJsonSerializer::Deserialize(Reader, JsonResponse))
        {
            FString TransactionId;
            if (JsonResponse->TryGetStringField("transid", TransactionId))
            {
                CurrentTransactionId = TransactionId;
                UE_LOG(LogTemp, Log, TEXT("Transaction initiated. Id: %s"), *TransactionId);
            }
            else if (JsonResponse->HasField("error"))
            {
                FString Error = JsonResponse->GetStringField("error");
                UE_LOG(LogTemp, Error, TEXT("Error from API: %s"), *Error);
            }
        }
    });
}

void AMicrotransaction::FinishPurchase(const FString& OrderId)
{
    TSharedRef<FJsonObject> RequestData = MakeShared<FJsonObject>();
    RequestData->SetStringField("orderId", OrderId);
    RequestData->SetStringField("appId", AppId);

    MakeApiCall(BaseUrl + "/FinalizePurchase", RequestData, [this](FHttpResponsePtr Response, bool bSuccess)
    {
        if (!bSuccess || !Response.IsValid())
        {
            UE_LOG(LogTemp, Error, TEXT("Error finalizing purchase: %s"), *Response->GetContentAsString());
            return;
        }

        TSharedPtr<FJsonObject> JsonResponse;
        TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Response->GetContentAsString());
        if (FJsonSerializer::Deserialize(Reader, JsonResponse))
        {
            bool bRequestSuccess;
            if (JsonResponse->TryGetBoolField("success", bRequestSuccess) && bRequestSuccess)
            {
                CurrentCoins += 1000;
                UE_LOG(LogTemp, Log, TEXT("Transaction Finished. Coins added: 1000"));
                bIsInPurchaseProcess = false;
            }
            else if (JsonResponse->HasField("error"))
            {
                FString Error = JsonResponse->GetStringField("error");
                UE_LOG(LogTemp, Error, TEXT("Error from API: %s"), *Error);
            }
        }
    });
}

void AMicrotransaction::OnMicroTxnAuthorizationResponse(const FSteamMicroTxnAuthorizationResponse& Response)
{
    if (Response.bAuthorized)
    {
        FinishPurchase(FString::FromInt(Response.OrderID));
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("Purchase was not authorized by the user."));
    }
    UE_LOG(LogTemp, Log, TEXT("MicroTxnAuthorizationResponse received - AppID: %d, OrderID: %d, Authorized: %d"), Response.AppID, Response.OrderID, Response.bAuthorized);
}

void AMicrotransaction::MakeApiCall(const FString& ApiEndPoint, const TSharedRef<FJsonObject> RequestData, TFunction<void(FHttpResponsePtr, bool)> Callback)
{
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(ApiEndPoint);
    Request->SetVerb("POST");
    Request->SetHeader(TEXT("Content-Type"), TEXT("application/json"));

    FString RequestBody;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&RequestBody);
    FJsonSerializer::Serialize(RequestData, Writer);
    Request->SetContentAsString(RequestBody);

    Request->OnProcessRequestComplete().BindLambda([Callback](FHttpRequestPtr RequestPtr, FHttpResponsePtr Response, bool bSuccess)
    {
        Callback(Response, bSuccess);
    });

    Request->ProcessRequest();
}