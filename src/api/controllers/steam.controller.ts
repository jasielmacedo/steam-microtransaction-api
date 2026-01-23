import constants from '@src/constants';

import { FetchError } from '@src/lib/httpclient';
import {
  ISteamAdjustAgreement,
  ISteamOpenTransaction,
  ISteamProcessAgreement,
  ISteamReportParams,
  ISteamTransaction,
} from '@src/steam/steaminterfaces';
import { Request, Response } from 'express';

const validateError = (res: Response, err: unknown): void => {
  if (err instanceof FetchError) {
    const status = err.status ?? 400;

    if (status === 403) {
      res.status(403).json({ error: 'Invalid Steam WebKey' });
      return;
    }

    res.status(status).json({ error: err.message || 'Something went wrong' });
    return;
  }

  if (err instanceof Error) {
    res.status(400).json({ error: err.message || 'Something went wrong' });
    return;
  }

  res.status(500).json({ error: 'An unexpected error occurred' });
};

export default {
  getReliableUserInfo: async (req: Request, res: Response): Promise<void> => {
    const { steamId, appId } = req.body;
    if (!steamId || !appId) {
      res.status(400).json({ error: 'Missing steamId or appId' });
      return;
    }

    try {
      const data = await req.steam.steamMicrotransactionGetUserInfo(steamId, appId);

      const success =
        data.response.result === 'OK' &&
        (data.response.params.status === 'Active' || data.response.params.status === 'Trusted');

      if (!success) {
        throw new Error(data.response?.error?.errordesc ?? 'Steam API returned unknown error');
      }

      res.status(200).json({ success });
    } catch (err) {
      validateError(res, err);
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
      validateError(res, err);
    }
  },

  initPurchase: async (req: Request, res: Response): Promise<void> => {
    const { appId, category, itemDescription, itemId, orderId, steamId }: ISteamOpenTransaction =
      req.body;

    if (!appId || !category || !itemDescription || !itemId || !orderId || !steamId) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    const product = constants.products.find(p => p.id.toString() === itemId.toString());

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
      validateError(res, err);
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
      validateError(res, err);
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
      validateError(res, err);
    }
  },

  getReport: async (req: Request, res: Response): Promise<void> => {
    const { appId, time, type, maxResults }: ISteamReportParams = req.body;

    if (!appId || !time) {
      res.status(400).json({ error: 'Missing fields appId or time' });
      return;
    }

    try {
      const data = await req.steam.steamGetReport({ appId, time, type, maxResults });

      if (data.response?.result !== 'OK') {
        throw new Error(data.response?.error?.errordesc ?? 'Steam API returned unknown error');
      }

      res.status(200).json({ success: true, ...data.response.params });
    } catch (err) {
      validateError(res, err);
    }
  },

  getUserAgreements: async (req: Request, res: Response): Promise<void> => {
    const { steamId, appId } = req.body;

    if (!steamId || !appId) {
      res.status(400).json({ error: 'Missing fields steamId or appId' });
      return;
    }

    try {
      const data = await req.steam.steamGetUserAgreementInfo(steamId, appId);

      if (data.response?.result !== 'OK') {
        throw new Error(data.response?.error?.errordesc ?? 'Steam API returned unknown error');
      }

      res.status(200).json({ success: true, ...data.response.params });
    } catch (err) {
      validateError(res, err);
    }
  },

  processAgreement: async (req: Request, res: Response): Promise<void> => {
    const { steamId, agreementId, appId, orderId, amount, currency }: ISteamProcessAgreement =
      req.body;

    if (!steamId || !agreementId || !appId || !orderId || !amount || !currency) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    try {
      const data = await req.steam.steamProcessAgreement({
        steamId,
        agreementId,
        appId,
        orderId,
        amount,
        currency,
      });

      const success = data.response.result === 'OK' && data.response.params.transid;

      if (!success) {
        throw new Error(data.response?.error?.errordesc ?? 'Steam API returned unknown error');
      }

      res.status(200).json({ success: true, ...data.response.params });
    } catch (err) {
      validateError(res, err);
    }
  },

  adjustAgreement: async (req: Request, res: Response): Promise<void> => {
    const {
      steamId,
      agreementId,
      appId,
      nextProcessDate,
      oldNextProcessDate,
    }: ISteamAdjustAgreement = req.body;

    if (!steamId || !agreementId || !appId || !nextProcessDate) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    try {
      const data = await req.steam.steamAdjustAgreement({
        steamId,
        agreementId,
        appId,
        nextProcessDate,
        oldNextProcessDate,
      });

      if (data.response?.result !== 'OK') {
        throw new Error(data.response?.error?.errordesc ?? 'Steam API returned unknown error');
      }

      res.status(200).json({ success: true, ...data.response.params });
    } catch (err) {
      validateError(res, err);
    }
  },

  cancelAgreement: async (req: Request, res: Response): Promise<void> => {
    const { steamId, agreementId, appId } = req.body;

    if (!steamId || !agreementId || !appId) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    try {
      const data = await req.steam.steamCancelAgreement(steamId, agreementId, appId);

      if (data.response?.result !== 'OK') {
        throw new Error(data.response?.error?.errordesc ?? 'Steam API returned unknown error');
      }

      res.status(200).json({ success: true, ...data.response.params });
    } catch (err) {
      validateError(res, err);
    }
  },
};
