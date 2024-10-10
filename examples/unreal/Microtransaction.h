#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Interfaces/IHttpRequest.h"
#include "Microtransaction.generated.h"

UCLASS()
class AMicrotransaction : public AActor
{
    GENERATED_BODY()

public:
    // Sets default values for this actor's properties
    AMicrotransaction();

protected:
    // Called when the game starts or when spawned
    virtual void BeginPlay() override;

public:
    // Called every frame
    virtual void Tick(float DeltaTime) override;

    // Function to initialize purchase
    UFUNCTION(BlueprintCallable, Category = "Microtransaction")
    void InitializePurchase();

    // Function to finalize purchase
    UFUNCTION(BlueprintCallable, Category = "Microtransaction")
    void FinishPurchase(const FString& OrderId);

    // Callback function for handling purchase authorization response
    void OnMicroTxnAuthorizationResponse(const FSteamMicroTxnAuthorizationResponse& Response);

private:
    // Steam App ID
    UPROPERTY(EditAnywhere, Category = "Microtransaction")
    FString AppId = "480";

    // Base URL for the API
    UPROPERTY(EditAnywhere, Category = "Microtransaction")
    FString BaseUrl = "http://yourapi.com";

    // Current order ID
    int32 CurrentOrder;

    // Current transaction ID
    FString CurrentTransactionId;

    // Indicates if the purchase process is ongoing
    bool bIsInPurchaseProcess;

    // Current coins owned by the player
    int32 CurrentCoins;

    // Function to send HTTP POST request
    void MakeApiCall(const FString& ApiEndPoint, const TSharedRef<FJsonObject> RequestData, TFunction<void(FHttpResponsePtr, bool)> Callback);
};