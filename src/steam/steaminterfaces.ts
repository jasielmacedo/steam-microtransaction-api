export declare interface SteamOptions {
  webkey: string;
  url: string;
  version: number;
}

export declare interface ISteamAppId {
  // steam id
  appId: string;
}

export declare interface ISteamUserRequest extends ISteamAppId {
  // steam user id
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
  currency: number;
  itemId: string;
  itemDescription: string;
  category: string;
}

export declare interface ISteamOwnershipResponse {
  ownsapp: boolean;
  permanent: boolean;
  timestamp: string;
  ownersteamid: string;
  sitelicense: boolean;
  result: string;
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
      items: [
        {
          itemid: string;
          qty: number;
          amount: string;
          vat: string;
          itemstatus: string;
        }
      ];
    };
    error: {
      errorcode: string;
      errordesc: string;
    };
  };
}
