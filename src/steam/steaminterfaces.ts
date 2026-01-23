export declare interface SteamOptions {
  webkey: string;
  url: string;
  version: number;
}

export declare interface ISteamAppId {
  appId: string;
}

export declare interface ISteamUserRequest extends ISteamAppId {
  steamId: string;
}

export declare interface ISteamUserTicket extends ISteamAppId {
  ticket: string;
}

export declare interface ISteamOrder extends ISteamAppId {
  orderId: string;
}

export declare interface ISteamTransaction extends ISteamOrder {
  transId: string;
}

export declare interface ISteamOpenTransaction extends ISteamUserRequest {
  orderId: string;
  amount: number;
  itemId: string;
  itemDescription: string;
  category: string;
}

export declare interface ISteamOwnershipResponse {
  appownership: {
    ownsapp: boolean;
    permanent: boolean;
    timestamp: string;
    timeexpires: string;
    ownersteamid: string;
    sitelicense: boolean;
    usercanceled: boolean;
    result: string;
  };
}

export declare interface ISteamMicroGetUserInfo {
  response: {
    result: 'OK' | 'Failure';
    params: {
      state: string;
      country: string;
      currency: string;
      status: string;
    };
    error: {
      errorcode: string;
      errordesc: string;
    };
  };
}

export declare interface ISteamMicroTx {
  response: {
    result: 'OK' | 'Failure';
    params: {
      orderid: string;
      transid: string;
    };
    error: {
      errorcode: string;
      errordesc: string;
    };
  };
}

export declare interface ISteamQueryTxResponse {
  response: {
    result: 'OK' | 'Failure';
    params: {
      orderid: string;
      transid: string;
      steamid: string;
      status: string;
      currency: string;
      time: string;
      country: string;
      usstate: string;
      items: Array<{
        itemid: string;
        qty: number;
        amount: string;
        vat: string;
        itemstatus: string;
      }>;
    };
    error: {
      errorcode: string;
      errordesc: string;
    };
  };
}

// Report interfaces
export declare interface ISteamReportParams {
  appId: string;
  time: string;
  type?: 'GAMESALES' | 'STEAMSTORESALES' | 'SETTLEMENT' | 'CHARGEBACK' | 'SUBSCRIPTION';
  maxResults?: number;
}

export declare interface ISteamReportResponse {
  response: {
    result: 'OK' | 'Failure';
    params: {
      orders: Array<{
        orderid: string;
        transid: string;
        steamid: string;
        status: string;
        currency: string;
        time: string;
        country: string;
        usstate: string;
        items: Array<{
          itemid: string;
          qty: number;
          amount: string;
          vat: string;
          itemstatus: string;
        }>;
      }>;
    };
    error?: {
      errorcode: string;
      errordesc: string;
    };
  };
}

// Agreement/Subscription interfaces
export declare interface ISteamAgreementInfoResponse {
  response: {
    result: 'OK' | 'Failure';
    params: {
      agreements: Array<{
        agreementid: string;
        itemid: string;
        status: 'Active' | 'Canceled' | 'Processing';
        period: string;
        frequency: number;
        startdate: string;
        enddate: string;
        nextprocessdate: string;
        recurringamt: string;
        currency: string;
        outstanding: string;
        lastpayment: string;
        lastamount: string;
      }>;
    };
    error?: {
      errorcode: string;
      errordesc: string;
    };
  };
}

export declare interface ISteamProcessAgreement {
  steamId: string;
  agreementId: string;
  appId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export declare interface ISteamAdjustAgreement {
  steamId: string;
  agreementId: string;
  appId: string;
  nextProcessDate: string;
  oldNextProcessDate?: string;
}

export declare interface ISteamAgreementResponse {
  response: {
    result: 'OK' | 'Failure';
    params: {
      agreementid: string;
      nextprocessdate?: string;
    };
    error?: {
      errorcode: string;
      errordesc: string;
    };
  };
}
