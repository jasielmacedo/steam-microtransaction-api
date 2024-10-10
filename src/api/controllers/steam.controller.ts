import constants from '@src/constants';
import { ISteamOpenTransaction, ISteamTransaction } from '@src/steam/steaminterfaces';
import { Request, Response } from 'express';

import { chain } from 'lodash';

// Improving type annotations for errors and response objects
interface CustomError extends Error {
  response?: {
    status?: number;
    error?: {
      errordesc?: string;
    };
  };
}

const validateError = (res: Response, err: CustomError): void => {
  const status = err?.response?.status ?? 400;

  if (status === 403) {
    res.status(403).json({ error: 'Invalid Steam WebKey' });
    return;
  }

  res.status(status).json({ error: err.message || 'Something went wrong' });
};

export default {
  getReliableUserInfo: async (req: Request, res: Response): Promise<void> => {
    const { steamId } = req.body;
    if (!steamId) {
      res.status(400).json({ error: 'Invalid steamId' });
      return;
    }

    try {
      const data = await req.steam.steamMicrotransactionGetUserInfo(steamId);

      const success =
        data.response.result === 'OK' &&
        (data.response.params.status === 'Active' || data.response.params.status === 'Trusted');

      if (!success) {
        throw new Error(data.response?.error?.errordesc ?? 'Steam API returned unknown error');
      }

      res.status(200).json({ success });
    } catch (err) {
      validateError(res, err as CustomError);
    }
  },

  checkAppOwnership: async (req: Request, res: Response): Promise<void> => {
    const { steamId, appId } = req.body;

    if (!appId || !steamId) {
      res.status(400).json({ error: 'Missing fields steamId or appId' });
      return;
    }

    try {
      const data = await req.steam.steamCheckAppOwnership({ appId, steamId });

      const success = data.appownership.result === 'OK' && data.appownership.ownsapp;

      if (!success) {
        throw new Error('The specified steamId has not purchased the provided appId');
      }

      res.status(200).json({ success });
    } catch (err) {
      validateError(res, err as CustomError);
    }
  },

  initPurchase: async (req: Request, res: Response): Promise<void> => {
    const { appId, category, itemDescription, itemId, orderId, steamId }: ISteamOpenTransaction =
      req.body;

    if (!appId || !category || !itemDescription || !itemId || !orderId || !steamId) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    const product = chain(constants.products)
      .filter(p => p.id.toString() == itemId)
      .first()
      .value();

    if (!product) {
      res.status(400).json({ error: 'ItemId not found in the game database' });
      return;
    }

    try {
      const data = await req.steam.steamMicrotransactionInitWithOneItem({
        appId,
        category,
        amount: product.price,
        itemDescription,
        itemId,
        orderId,
        steamId,
      });

      const success = data.response.result === 'OK' && data.response.params.transid;

      if (!success) {
        throw new Error(data.response?.error?.errordesc ?? 'Steam API returned unknown error');
      }

      res.status(200).json({ transid: data.response.params.transid });
    } catch (err) {
      validateError(res, err as CustomError);
    }
  },

  checkPurchaseStatus: async (req: Request, res: Response): Promise<void> => {
    const { appId, orderId, transId }: ISteamTransaction = req.body;

    if (!appId || !orderId || !transId) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    try {
      const data = await req.steam.steamMicrotransactionCheckRequest({ appId, orderId, transId });

      if (data.response?.result !== 'OK') {
        throw new Error(data.response?.error?.errordesc ?? 'Steam API returned unknown error');
      }

      res.status(200).json({ success: true, ...data.response.params });
    } catch (err) {
      validateError(res, err as CustomError);
    }
  },

  finalizePurchase: async (req: Request, res: Response): Promise<void> => {
    const { orderId, appId } = req.body;

    if (!orderId || !appId) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    try {
      const data = await req.steam.steamMicrotransactionFinalizeTransaction(appId, orderId);

      res.status(200).json({
        success: data.response.result === 'OK',
        ...(data.response?.error ? { error: data.response?.error?.errordesc } : {}),
      });
    } catch (err) {
      validateError(res, err as CustomError);
    }
  },
};
