# Steam Microtransaction API

An intermediate api to handle steam microtransactions (In Game Purchases) using steam web services.

You can use and consume this API with Unity, Unreal, Godot or any engine you want to develop a steam game.

## What is this?

If you want to implement micro-transactions in your game you need to create a webservice to handle and request the Steam WEB API.

To save time and money, I decided to create one unique code to help game developers to implement microtransactions quickly.

## How to start the API?

This is a Typescript (Nodejs v12+) Based API and you can use services like heroku, digital ocean to publish this API.

- Install node v12+
- Clone or Fork this repository
- Generate your Steam WEBKEY [https://steamcommunity.com/dev](https://steamcommunity.com/dev)
- Replace ./src/constants.ts values according with your informations
- Run ```npm install``` to install the dependencies
- To test if your webkey is valid run ```npm run test```
- And to start the aplication simply run ```npm start```

## Integrate with your game

You can check the documentation on the ./documentation folder

The flow is:

- The user (player) clicks on the UI product
- Your game call /InitPurchase endpoint to start the purchase.
- The game will popup a confirmation dialog
- The user buy the item
- *The game receive a callback confirming the purchase
- Your game call /FinalizePurchase endpoint
- And That's it

*If the user have parental control and the callback was not called, you can check the status calling the /CheckPurchaseStatus

In-Game Purchases is not complicated but you need to be sure if the steam user is reliable.

To avoid scammers, simply call the /GetReliableUserInfo endpoint if the return is true, you can start the microtransaction. 