import constants from '@src/constants';

import {
  ISteamAdjustAgreement,
  ISteamAgreementInfoResponse,
  ISteamAgreementResponse,
  ISteamMicroGetUserInfo,
  ISteamMicroTx,
  ISteamOpenTransaction,
  ISteamOwnershipResponse,
  ISteamProcessAgreement,
  ISteamQueryTxResponse,
  ISteamReportParams,
  ISteamReportResponse,
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
  async steamCheckAppOwnership(info: ISteamUserRequest): Promise<ISteamOwnershipResponse> {
    const data = {
      key: this.options.webkey,
      steamid: info.steamId,
      appid: info.appId,
    };

    return await this._get<ISteamOwnershipResponse>('ISteamUser', 'CheckAppOwnership', 4, data);
  }

  /**
   * @param info
   * @see https://partner.steamgames.com/doc/webapi/ISteamUserAuth#AuthenticateUserTicket
   */
  async steamAuthenticateUserTicket(info: ISteamUserTicket): Promise<any> {
    const data = {
      key: this.options.webkey,
      appid: info.appId,
      ticket: info.ticket,
    };

    return await this._get('ISteamUserAuth', 'AuthenticateUserTicket', this.options.version, data);
  }

  /**
   * To check if user brought something on steam to avoid scammers
   * @param steamId
   * @param appId
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#GetUserInfo
   */
  async steamMicrotransactionGetUserInfo(
    steamId: string,
    appId: string,
  ): Promise<ISteamMicroGetUserInfo> {
    const data = {
      key: this.options.webkey,
      steamid: steamId,
      appid: appId,
    };

    return await this._get<ISteamMicroGetUserInfo>(this.interface, 'GetUserInfo', 2, data);
  }

  /**
   * Initialize the microtransaction purchase.
   * If the user has the appid opened, the confirm purchase popup will appear
   * @params _transaction
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#InitTxn
   */
  async steamMicrotransactionInitWithOneItem(
    transaction: ISteamOpenTransaction,
  ): Promise<ISteamMicroTx> {
    const formData = new URLSearchParams({
      key: this.options.webkey,
      orderid: transaction.orderId,
      steamid: transaction.steamId,
      appid: transaction.appId,
      itemcount: '1',
      currency: constants.currency,
      language: constants.locale,
      usersession: 'client',
      'itemid[0]': transaction.itemId,
      'qty[0]': '1',
      'amount[0]': transaction.amount.toString(),
      'description[0]': transaction.itemDescription,
      'category[0]': transaction.category,
    });

    return await this._post<ISteamMicroTx>(
      this.interface,
      'InitTxn',
      3,
      formData,
      `https://api.steampowered.com/`,
    );
  }

  /**
   * Use to check the status of the transaction
   * @param info
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#QueryTxn
   */
  async steamMicrotransactionCheckRequest(info: ISteamTransaction): Promise<ISteamQueryTxResponse> {
    const data = {
      key: this.options.webkey,
      orderid: info.orderId,
      appid: info.appId,
      transid: info.transId,
    };

    return await this._get<ISteamQueryTxResponse>(this.interface, 'QueryTxn', 3, data);
  }

  /**
   * When the user confirms the transaction. One callback is called on the client-side. Use this callback to call finalize function
   *
   * @param appId
   * @param orderid
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#FinalizeTxn
   */
  async steamMicrotransactionFinalizeTransaction(
    appId: string,
    orderid: string,
  ): Promise<ISteamMicroTx> {
    const formData = new URLSearchParams({
      key: this.options.webkey,
      orderid: orderid,
      appid: appId,
    });

    return await this._post<ISteamMicroTx>(this.interface, 'FinalizeTxn', 2, formData);
  }

  /**
   * Get transaction/sales report
   * @param params Report parameters
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#GetReport
   */
  async steamGetReport(params: ISteamReportParams): Promise<ISteamReportResponse> {
    const data: Record<string, string> = {
      key: this.options.webkey,
      appid: params.appId,
      time: params.time,
    };

    if (params.type) {
      data.type = params.type;
    }
    if (params.maxResults) {
      data.maxresults = params.maxResults.toString();
    }

    return await this._get<ISteamReportResponse>(this.interface, 'GetReport', 5, data);
  }

  /**
   * Get user's billing agreements (subscriptions)
   * @param steamId User's Steam ID
   * @param appId Application ID
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#GetUserAgreementInfo
   */
  async steamGetUserAgreementInfo(
    steamId: string,
    appId: string,
  ): Promise<ISteamAgreementInfoResponse> {
    const data = {
      key: this.options.webkey,
      steamid: steamId,
      appid: appId,
    };

    return await this._get<ISteamAgreementInfoResponse>(
      this.interface,
      'GetUserAgreementInfo',
      2,
      data,
    );
  }

  /**
   * Process a recurring subscription charge
   * @param params Process agreement parameters
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#ProcessAgreement
   */
  async steamProcessAgreement(params: ISteamProcessAgreement): Promise<ISteamMicroTx> {
    const formData = new URLSearchParams({
      key: this.options.webkey,
      steamid: params.steamId,
      agreementid: params.agreementId,
      appid: params.appId,
      orderid: params.orderId,
      amount: params.amount.toString(),
      currency: params.currency,
    });

    return await this._post<ISteamMicroTx>(this.interface, 'ProcessAgreement', 1, formData);
  }

  /**
   * Adjust the next billing date for a subscription
   * @param params Adjust agreement parameters
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#AdjustAgreement
   */
  async steamAdjustAgreement(params: ISteamAdjustAgreement): Promise<ISteamAgreementResponse> {
    const formData = new URLSearchParams({
      key: this.options.webkey,
      steamid: params.steamId,
      agreementid: params.agreementId,
      appid: params.appId,
      nextprocessdate: params.nextProcessDate,
    });

    if (params.oldNextProcessDate) {
      formData.append('oldnextprocessdate', params.oldNextProcessDate);
    }

    return await this._post<ISteamAgreementResponse>(
      this.interface,
      'AdjustAgreement',
      1,
      formData,
    );
  }

  /**
   * Cancel a billing agreement (subscription)
   * @param steamId User's Steam ID
   * @param agreementId Agreement ID to cancel
   * @param appId Application ID
   * @see https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#CancelAgreement
   */
  async steamCancelAgreement(
    steamId: string,
    agreementId: string,
    appId: string,
  ): Promise<ISteamAgreementResponse> {
    const formData = new URLSearchParams({
      key: this.options.webkey,
      steamid: steamId,
      agreementid: agreementId,
      appid: appId,
    });

    return await this._post<ISteamAgreementResponse>(
      this.interface,
      'CancelAgreement',
      1,
      formData,
    );
  }

  private async _get<T>(
    interf: string,
    method: string,
    version: number,
    data: Record<string, string>,
    url: string = this.options.url,
  ): Promise<T> {
    const parsed = new URLSearchParams(data).toString();
    const urlRequested = `${url}${interf}/${method}/v${version}/?${parsed}`;
    return await this.httpClient.get<T>(urlRequested);
  }

  private async _post<T>(
    interf: string,
    method: string,
    version: number,
    data: URLSearchParams,
    url: string = this.options.url,
  ): Promise<T> {
    const urlRequested = `${url}${interf}/${method}/v${version}/`;
    return await this.httpClient.post<T>(urlRequested, data);
  }
}
