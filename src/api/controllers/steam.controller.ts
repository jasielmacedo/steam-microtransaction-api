import { ISteamOpenTransaction, ISteamTransaction } from '@src/steam/steaminterfaces';
import { Request, Response } from 'express';

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
      res.status(500).json({ error: err.message || 'Something went wrong' });
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
      res.status(500).json({ error: err.message || 'Something went wrong' });
    }
  },
  initPurchase: async (req: Request, res: Response): Promise<void> => {
    const {
      appId,
      category,
      currency,
      itemDescription,
      itemId,
      orderId,
      steamId,
    }: ISteamOpenTransaction = <ISteamOpenTransaction>{ ...req.body };

    if (!appId || !category || !currency || !itemDescription || !itemId || !orderId || !steamId) {
      res.status(400).json({
        error: 'Missing fields',
      });
      return;
    }

    try {
      const data = await req.steam.steamMicrotransactionInitWithOneItem({
        appId,
        category,
        currency,
        itemDescription,
        itemId,
        orderId,
        steamId,
      });

      if (data.response.result == 'OK' && data.response.params.transid) {
        res.status(200).json({ transid: data.response.params.transid });
      } else {
        res.status(400).json({ error: 'Something went wrong with the steam partner api' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message || 'Something went wrong' });
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
      else res.status(400).json({ error: 'Something went wrong on the Steam API' });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Something went wrong' });
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
      const data = await req.steam.steamMicrotransactionFinalizeTransaction(orderId, appId);

      res.status(200).json({
        success: data.response.result == 'OK',
      });
    } catch (err) {
      res.status(400).json({ error: err.message || 'Something went wrong' });
    }
  },
};
