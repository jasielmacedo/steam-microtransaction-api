import products from './products.json';

export default {
  /**
   *  Don't forget to generate your own steam webkey
   *  To generate the proper key, you need to implement the WebAPIKey from
   *  Steam Developer Page, User&Permissions -> Manage Group -> (Your App's name)
   */
  webkey: process.env.STEAM_WEBKEY,
  /**
   *  Define the list of products to be used by the transaction system to prevent users to send lower or higher price
   *  for these products.
   */
  products,
  /**
   * Useful during transaction creation
   * Steam automatically converts from this currency to the user local currency.
   * But you can change as you please.
   * See https://partner.steamgames.com/doc/store/pricing/currencies
   */
  currency: process.env.STEAM_CURRENCY || 'USD',
  /**
   * Used to define the locale of the item
   */
  locale: process.env.STEAM_ITEM_LOCALE || 'en',
  /**
   * Set true if you want to enable sandbox mode
   * Please check https://partner.steamgames.com/doc/webapi/ISteamMicroTxnSandbox for more info
   */
  development: process.env.NODE_ENV == 'test' || process.env.NODE_ENV === 'development',
};
