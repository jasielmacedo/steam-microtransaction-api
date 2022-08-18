import constants from '@src/constants';
import { ISteamOpenTransaction, ISteamTransaction } from '@src/steam/steaminterfaces';
import { Request, Response } from 'express';

import { chain } from 'lodash';

export default {
  getReliableUserInfo: async (req: Request, res: Response): Promise<void> => {
    const { steamId } = req.body;
    if (!steamId) {
      res.status(400).json({
        error: 'invalid steamId',
      });
      return;
    }

    try {
      const data = await req.steam.steamMicrotransactionGetUserInfo(steamId);

      const success =
        data.response.result == 'OK' &&
        (data.response.params.status == 'Active' || data.response.params.status == 'Trusted');
      res.status(200).json({
        success,
      });
    } catch (err) {
      res.status(403).json({ error: err.message || 'Something went wrong' });
    }
  },
  checkAppOwnership: async (req: Request, res: Response): Promise<void> => {
    const { steamId, appId } = req.body;

    if (!appId || !steamId) {
      res.status(400).json({
        error: 'Missing fields steamId or AppId',
      });
      return;
    }

    try {
      const data = await req.steam.steamCheckAppOwnership({
        appId,
        steamId,
      });

      res.status(200).json({
        success: data.appownership.result == 'OK' && data.appownership.ownsapp,
      });
    } catch (err) {
      res.status(403).json({ error: err.message || 'Something went wrong' });
    }
  },
  initPurchase: async (req: Request, res: Response): Promise<void> => {
    const { appId, category, itemDescription, itemId, orderId, steamId }: ISteamOpenTransaction = <
      ISteamOpenTransaction
    >{ ...req.body };

    if (!appId || !category || !itemDescription || !itemId || !orderId || !steamId) {
      res.status(400).json({
        error: 'Missing fields',
      });
      return;
    }

    const product = chain(constants.products)
      .filter(p => p.id.toString() == itemId)
      .first()
      .value();

    if (!product) {
      res.status(400).json({
        error: 'ItemId not found',
      });
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

      if (data.response.result == 'OK' && data.response.params.transid) {
        res.status(200).json({ transid: data.response.params.transid });
      } else {
        res.status(400).json({
          transid: null,
          error:
            data.response?.error?.errordesc || 'Something went wrong with the steam partner api',
        });
      }
    } catch (err) {
      res.status(403).json({ error: err.message || 'Something went wrong' });
    }
  },
  checkPurchaseStatus: async (req: Request, res: Response): Promise<void> => {
    const { appId, orderId, transId }: ISteamTransaction = <ISteamTransaction>{ ...req.body };
    if (!appId || !orderId || !transId) {
      res.status(400).json({
        error: 'Missing fields',
      });
      return;
    }

    try {
      const data = await req.steam.steamMicrotransactionCheckRequest({ appId, orderId, transId });

      if (data.response.result == 'OK')
        res.status(200).json({ success: true, ...data.response.params });
      else
        res.status(400).json({
          success: false,
          error: data.response?.error?.errordesc || 'Something went wrong on the Steam API',
        });
    } catch (err) {
      res.status(403).json({ success: false, error: err.message || 'Something went wrong' });
    }
  },
  finalizePurchase: async (req: Request, res: Response): Promise<void> => {
    const { orderId, appId } = req.body;
    if (!orderId || !appId) {
      res.status(400).json({
        error: 'Missing fields',
      });
      return;
    }

    try {
      const data = await req.steam.steamMicrotransactionFinalizeTransaction(appId, orderId);

      res.status(200).json({
        success: data.response.result == 'OK',
        ...(data.response?.error ? { error: data.response?.error?.errordesc } : {}),
      });
    } catch (err) {
      res.status(403).json({ error: err.message || 'Something went wrong' });
    }
  },
};
