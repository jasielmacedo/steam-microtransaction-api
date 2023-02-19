# Steam Microtransaction Bridge API [![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/NF7Fuhr2FZ)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jasielmacedo/steam-microtransaction-api)

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/jasielmacedo/steam-microtransaction-api/tree/main)

An intermediate api to handle steam microtransactions (In Game Purchases) using steam web services.

You can use this repo to fork and host an API to be used with Unity, Unreal, Godot or any engine you want to develop a steam game.

## READ BEFORE USE

This Bridge API has been created based on the Steam Partner API recommendations.

If you need to implement microtransactions in your game, **you must create** a web service to handle and request the Steam WEB API, and that's precisely the purpose of this repository.

To help game developers save time and money, I've created a single code that enables them to implement microtransactions quickly.

With this repository, you can use Heroku or Digital Ocean to deploy your own API with just a few clicks. See [Heroku git deploy](https://devcenter.heroku.com/articles/git) or [Digital Ocean Deploy](https://docs.digitalocean.com/products/app-platform/quickstart/#destroy-an-app), or choose any other host you prefer.

## WHY DO I NEED TO USE THIS REPO OR CREATE MY OWN? CAN I MAKE REQUESTS DIRECTLY FROM MY GAME?

First of all, it's important to read Steam's recommendations on this topic: [https://partner.steamgames.com/doc/features/microtransactions](https://partner.steamgames.com/doc/features/microtransactions)

Steam doesn't recommend calling the Steam Partner API directly from your game. Instead, you should create your own API to act as a bridge between your game and Steam. That's the purpose of this API repository.

## HOW TO START THE API?

This is a TypeScript (Node.js v18+) based API, and you can use services like Heroku or Digital Ocean to publish it.

To get started, follow these steps:

1.  Install Node.js v18+.
2.  Clone or fork this repository.
3.  Generate your Steam WEB API key.

To run the API locally and for testing, duplicate the file `env.example` and rename it to `.env`, and then update it with the correct values.

4.  Run `yarn` to install the dependencies.
5.  To test if everything is working, run `yarn test`.
6.  To start the application, run `yarn start`.

### CONFUSION ABOUT WEBKEY API GENERATION FOR STEAM IN-APP PURCHASES

There is some confusion about which webkey to use for Steam in-app purchases and API in-game. Here are the instructions for generating the correct key:

1.  Go to the [Steam Developer Page](https://partner.steamgames.com/dashboard).
2.  Click on the "Menu" button, and then select "User & Permissions."
3.  Click on "Manage Groups" and select your app's name.
4.  On the sidebar, you'll see a link that says "Generate WebAPI Key." Click on that link to generate the proper key.

## LIST OF PRODUCTS

To prevent users from sending arbitrary amounts for products, there is a file called `products.json` in the `src/` directory. Make sure to replace the ID and amount according to your list of products.

## INTEGRATING WITH YOUR GAME

You can check the documentation of this API here: [https://jasielmacedo.github.io/steam-microtransaction-api/](https://jasielmacedo.github.io/steam-microtransaction-api/)

The flow is as follows:

1.  The user (player) clicks on the UI product.
2.  Your game calls the `/InitPurchase` endpoint to start the purchase.
3.  The game will display a confirmation dialog (inside the game).
4.  The user buys the item (pays for it).
5.  The game receives a callback confirmation about the purchase.
6.  Your game calls the `/FinalizePurchase` endpoint.
7.  That's it.

If the user has parental control and the callback was not called, you can check the status by calling the `/CheckPurchaseStatus` endpoint.

### SECURITY CHECK

In-game purchases are not complicated, but you need to be sure that the Steam user is reliable. To avoid scammers, simply call the `/GetReliableUserInfo` endpoint. If the return is true, you can start the microtransaction.

## EXAMPLE WITH UNITY (C#)

You can check the example folder to see an example using Unity.

## ABOUT

Maybe you're thinking, "Have you tested this code properly?" Well, I used a similar version of this code inside a game called Deliverace. It's not available on Steam anymore, but this code works.

If you have any questions, suggestions, or issues, you can use the Issues area.

## CONTRIBUTION

You can contribute by opening a pull request. Together, we can help a lot of developers implement in-game purchases.
