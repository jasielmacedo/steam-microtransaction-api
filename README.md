# Steam Microtransaction Bridge API [![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/WvB5xYVw)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jasielmacedo/steam-microtransaction-api)

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/jasielmacedo/steam-microtransaction-api/tree/main)

An intermediate api to handle steam microtransactions (In Game Purchases) using steam web services.

You can use and consume this API with Unity, Unreal, Godot or any engine you want to develop a steam game.

## READ BEFORE USE

This Bridge API is created based on the Steam Partner API recommendations.

If you have to implement micro-transactions in your game **YOU MUST CREATE** a webservice to handle and request the Steam WEB API and This is the purpose of this repository.

To save time and money, I decided to create one unique code to help game developers to implement microtransactions quickly.

With this repository you can use Heroku or Digital Ocean to deploy your own api with few clicks. See [Heroku git deploy](https://devcenter.heroku.com/articles/git) or [Digital Ocean Deploy](https://docs.digitalocean.com/products/app-platform/quickstart/#destroy-an-app) or whatever host you choose.

## WHY I NEED TO USE THIS REPO OR CREATE MY OWN? CAN I MAKE REQUESTS DIRECTLY FROM MY GAME?

First of all, is important to read the Steam recommendations about this topic.
[https://partner.steamgames.com/doc/features/microtransactions](https://partner.steamgames.com/doc/features/microtransactions)

Steam doesn't recommend you to call the Steam Partner api directly from your game. You have to create your own API to act like a bridge between your game and the steam.

Again, that's is the purpose of this API repo.

## How to start the API?

This is a Typescript (Nodejs v12+) Based API and you can use services like heroku, digital ocean to publish this API.

- Install node v12+
- Clone or Fork this repository
- Generate your Steam WEBAPI KEY

To run locally and for tests, duplicate the file `env.example` and renamed it to `.env` and put the correct values on it.

- Run `npm install` to install the dependencies
- To test if everything is working, just run `npm run test`
- And to start the application simply run `npm start`

#### Confusion about WEBKEY API generation for Steam In-app purchases

STEAM has two webkeys but to use in Purchases and API in-game, follow the instruction below:

To generate the proper key, you need to implement the WebAPIKey from

- Go to [Steam Developer Page](https://partner.steamgames.com/dashboard)
- Menu -> User & Permissions -> Manage Groups -> (Your App's name)
- On the Sidebar there is a link: Generate WebAPI Key

## Integrate with your game

You can check the documentation of this API here
[https://jasielmacedo.github.io/steam-microtransaction-api/](https://jasielmacedo.github.io/steam-microtransaction-api/)

The flow is:

- The user (player) clicks on the UI product
- Your game call /InitPurchase endpoint to start the purchase.
- The game will popup a confirmation dialog (Inside the game)
- The user buy the item (pay for it)
- \*The game receive a callback confirmation about the purchase
- Your game call /FinalizePurchase endpoint
- And That's it

\*If the user have parental control and the callback was not called, you can check the status calling the /CheckPurchaseStatus

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
