# Unreal Engine Microtransaction Integration

This example demonstrates how to integrate Steam microtransactions in Unreal Engine using the Steamworks SDK and the Online Subsystem Steam. This guide provides an overview of how to set up microtransaction capabilities for your Unreal Engine project, enabling users to make purchases and receive virtual goods directly within your game.

## Prerequisites

- **Unreal Engine** (Version 4.25 or higher recommended)
- **Steamworks SDK** installed and configured
- **Steam Online Subsystem** enabled in your Unreal Engine project
- **API Server**: Ensure you have an API server set up to handle requests related to initializing and finalizing purchases

## File Overview

### \*\* \*\* and so

These files contain the implementation of the microtransaction class for Unreal Engine.

- **Microtransaction Class (**`******AMicrotransaction******`****\*\*****)\*\*: This class handles all operations related to microtransactions, such as initializing a purchase, finishing a purchase, and responding to purchase authorizations.
- **Functions**:

  - `InitializePurchase()`: Starts a microtransaction request by sending the necessary data to your API server.
  - `FinishPurchase(const FString& OrderId)`: Completes the transaction after authorization is confirmed.
  - `OnMicroTxnAuthorizationResponse(const FSteamMicroTxnAuthorizationResponse& Response)`: Callback function that handles the response after the user authorizes the purchase.
  - `MakeApiCall(const FString& ApiEndPoint, const TSharedRef<FJsonObject> RequestData, TFunction<void(FHttpResponsePtr, bool)> Callback)`: Utility function to handle HTTP requests to your API.

## Setup Instructions

### 1. Include the Necessary Modules

Make sure your `Build.cs` file includes the required modules:

```
PublicDependencyModuleNames.AddRange(new string[] { "OnlineSubsystem", "OnlineSubsystemUtils", "HTTP", "Json", "JsonUtilities" });
DynamicallyLoadedModuleNames.Add("OnlineSubsystemSteam");
```

### 2. Configure Steam Online Subsystem

Add the following settings to your project's `DefaultEngine.ini` to configure the Steam Online Subsystem:

```
[OnlineSubsystem]
DefaultPlatformService=Steam

[OnlineSubsystemSteam]
SteamDevAppId=480
bEnabled=true
```

Replace `480` with your game's Steam App ID.

### 3. Add the Microtransaction Actor

To use this script, add the `AMicrotransaction` actor to your level:

1.  Create a Blueprint from the `AMicrotransaction` class.
2.  Add it to your level or instantiate it programmatically.

### 4. Usage

#### Initialize a Purchase

To start a purchase, call `InitializePurchase()` from your Blueprint or game logic. This will initiate a purchase for the specified item.

#### Finish a Purchase

Once the transaction is authorized, the `FinishPurchase` method is automatically called to finalize the transaction. If successful, the item will be awarded to the player.

### 5. Error Handling

The script includes detailed logging to assist in diagnosing issues during the purchase process. Errors from the API, or issues with the Steam authorization, are logged to the console with a descriptive message.

Make sure to review these messages during development to ensure the system is working as intended.

## Important Considerations

- **Steam App ID**: Always replace the default `480` App ID with your own game's Steam App ID.
- **HTTP API**: The example relies on an HTTP API server to handle transactions. Ensure your server is secure and properly handles all microtransaction requests.
- **Testing**: Testing microtransactions on Steam requires that your game is properly configured on Steamworks and that you have the necessary permissions to test purchases.

## Further Resources

- Steamworks Documentation
- Unreal Engine Online Subsystem Documentation
- Unreal Engine HTTP Module

## License

This example is provided as-is with no warranty. Feel free to modify and adapt it to fit your project's requirements.
