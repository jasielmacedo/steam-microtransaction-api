import constants from '@src/constants';
import queryString from 'query-string';

import {
  ISteamMicroGetUserInfo,
  ISteamMicroTx,
  ISteamOpenTransaction,
  ISteamOwnershipResponse,
  ISteamQueryTxResponse,
  ISteamTransaction,
  ISteamUserRequest,
  ISteamUserTicket,
  SteamOptions,
} from './steaminterfaces';

import { HttpClient } from '@src/lib/httpclient';

export default class SteamRequest {
  private options: SteamOptions;
  private interface: string;

  constructor(private httpClient: HttpClient) {
    this.options = {
      webkey: constants.webkey,
      url: 'https://partner.steam-api.com/',
      version: 1,
    };

    this.interface = constants.development ? 'ISteamMicroTxnSandbox' : 'ISteamMicroTxn';
  }

  /**
   * Check if the User(steamid) owns the appid
   *
   * @param steamId
   * @param appId
   * @see https://partner.steamgames.com/doc/webapi/ISteamUser#CheckAppOwnership
   */
  steamCheckAppOwnership(info: ISteamUserRequest): Promise<ISteamOwnershipResponse> {
    const data = {
      key: this.options.webkey,
      steamid: info.steamId,
      appid: info.appId,
    };

    return this._get<ISteamOwnershipResponse>('ISteamUser', 'CheckAppOwnership', 2, data);
  }

  /**
   * @param info
   * @see https://partner.steamgames.com/doc/webapi/ISteamUserAuth#AuthenticateUserTicket
   */
  steamAuthenticateUserTicket(info: ISteamUserTicket): Promise<any> {
    const data = {
      key: this.options.webkey,
      appid: info.appId,
      ticket: info.ticket,
    };

    return this._get('ISteamUserAuth', 'AuthenticateUserTicket', this.options.version, data);
  }

  /**
   * To check if user brought something on steam to avoid scammers
   * @param steamId
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#GetUserInfo
   */
  steamMicrotransactionGetUserInfo(steamId: string): Promise<ISteamMicroGetUserInfo> {
    const data = {
      key: this.options.webkey,
      steamid: steamId,
    };

    return this._get<ISteamMicroGetUserInfo>(this.interface, 'GetUserInfo', 2, data);
  }

  /**
   * Initialize the microtransaction purchase.
   * If the user have the appid opened, the confirm purchase popup will appear
   * @params _transaction
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#InitTxn
   */
  steamMicrotransactionInitWithOneItem(transaction: ISteamOpenTransaction): Promise<ISteamMicroTx> {
    const formData = new URLSearchParams();
    formData.append('key', this.options.webkey);
    formData.append('orderid', transaction.orderId);
    formData.append('steamid', transaction.steamId);
    formData.append('appid', transaction.appId);
    formData.append('itemcount', '1');
    formData.append('currency', constants.currency);
    formData.append('language', constants.locale);
    formData.append('usersession', 'client');
    formData.append('itemid[0]', transaction.itemId);
    formData.append('qty[0]', '1');
    formData.append('amount[0]', transaction.amount + constants.currency);
    formData.append('description[0]', transaction.itemDescription);
    formData.append('category[0]', transaction.category);

    return this._post<ISteamMicroTx>(
      this.interface,
      'InitTxn',
      3,
      formData,
      `https://api.steampowered.com/`
    );
  }

  /**
   * Use to check the status of the transaction
   * @param info
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#QueryTxn
   */
  steamMicrotransactionCheckRequest(info: ISteamTransaction): Promise<ISteamQueryTxResponse> {
    const data = {
      key: this.options.webkey,
      orderid: info.orderId,
      appid: info.appId,
      transid: info.transId,
    };

    return this._get<ISteamQueryTxResponse>(this.interface, 'QueryTxn', 2, data);
  }

  /**
   * When the user confirm the transaction. One callback is called on client side. Use this callback to call finalize funcion
   *
   * @param appId
   * @param orderid
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#FinalizeTxn
   */
  steamMicrotransactionFinalizeTransaction(appId: string, orderid: string): Promise<ISteamMicroTx> {
    const formData = new URLSearchParams();
    formData.append('key', this.options.webkey);
    formData.append('orderid', orderid);
    formData.append('appid', appId);

    return this._post<ISteamMicroTx>(this.interface, 'FinalizeTxn', 2, formData);
  }

  private _get<T>(
    interf: string,
    method: string,
    version: number,
    data: any,
    url: string = this.options.url
  ): Promise<T> {
    const parsed = queryString.stringify(data);

    const urlRequested = `${url}${interf}/${method}/v${version}/?${parsed}`;
    return this.httpClient.get<T>(urlRequested);
  }

  private _post<T>(
    interf: string,
    method: string,
    version: number,
    data: any,
    url: string = this.options.url
  ): Promise<T> {
    const urlRequested = `${url}${interf}/${method}/v${version}/`;
    // eslint-disable-next-line no-console
    console.log(urlRequested);
    // eslint-disable-next-line no-console
    console.log(data);
    return this.httpClient.post<T>(urlRequested, data);
  }
}
