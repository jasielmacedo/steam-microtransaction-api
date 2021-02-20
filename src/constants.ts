export default {
  /**
   *  Don't forget to generate your own steam webkey
   *  Check https://steamcommunity.com/dev and https://steamcommunity.com/dev/registerkey for more info
   */
  webkey: 'YOUR-WEBKEY-STEAM-HERE',
  /**
   * Steam app ID
   * Replace with your app id
   */
  appId: '480',
  /**
   * SteamID (User id)
   * Replace this with some valid steam user id. Check if this id owns the appid above
   * This field will be used during tests
   * See https://steamid.io
   */
  steamId: 'A-VALID-STEAM-ID',
  /**
   * Useful during transaction creation
   * Steam automatically converts from this currency to the user local currency.
   * But you can change as you please.
   */
  currency: 'USD',
  /**
   * Used
   */
  locale: 'en',
  /**
   * Set true if you want to enable sandbox mode
   * Please check https://partner.steamgames.com/doc/webapi/ISteamMicroTxnSandbox for more info
   */
  development: process.env.NODE_ENV == 'test' || false,
};
