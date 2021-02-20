# Steam Microtransaction API

An intermediate api to handle steam microtransactions (In Game Purchases) using steam web services.

You can use and consume this API with Unity, Unreal, Godot or any engine you want to develop a steam game.

## What is this?

If you want to implement micro-transactions in your game you need to create a webservice to handle and request the Steam WEB API.

To save time and money, I decided to create one unique code to help game developers to implement microtransactions quickly.

With this repository you can use Heroku to deploy your own api without problem. See [Heroku git deploy](https://devcenter.heroku.com/articles/git)

## How to start the API?

This is a Typescript (Nodejs v12+) Based API and you can use services like heroku, digital ocean to publish this API.

- Install node v12+
- Clone or Fork this repository
- Generate your Steam WEBKEY [https://steamcommunity.com/dev](https://steamcommunity.com/dev)
- Replace ./src/constants.ts values according with your informations
- Run ```npm install``` to install the dependencies
- To test if your webkey is valid run ```npm run test```
- And to start the application simply run ```npm start```

## Integrate with your game

You can check the documentation of this API here
[https://jasielmacedo.github.io/steam-microtransaction-api/](https://jasielmacedo.github.io/steam-microtransaction-api/)

The flow is:

- The user (player) clicks on the UI product
- Your game call /InitPurchase endpoint to start the purchase.
- The game will popup a confirmation dialog (Inside the game)
- The user buy the item (pay for it)
- *The game receive a callback confirmation about the purchase
- Your game call /FinalizePurchase endpoint
- And That's it

*If the user have parental control and the callback was not called, you can check the status calling the /CheckPurchaseStatus

### Security check

In-Game Purchases is not complicated but you need to be sure if the steam user is reliable.

To avoid scammers, simply call the /GetReliableUserInfo endpoint if the return is true, you can start the microtransaction. 

## Example with Unity (C#)

You can check example folder to see an example using unity

## About

Ok, maybe you are thinking: "Have you tested this code properly?" Well I used a similar version of this code inside a game called Deliverace.
It's not available on steam anymore, but this code works.

If you have any question, suggestion or issues you can use the issues area.

## Contribuition

You can contribute, just opening a pull request. Together we can help a lot of developers to implement In-Game Purchases.