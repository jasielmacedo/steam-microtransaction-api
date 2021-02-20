import steamrequest from '@src/steam/steamrequest';

import { ISteamOpenTransaction, ISteamTransaction } from '@src/steam/steaminterfaces';
import { Request, Response } from 'express';

export default {
  getReliableUserInfo: (req: Request, res: Response): void => {
    const { steamId } = req.body;
    if (!steamId) {
      res.status(400).json({
        error: 'invalid steamId',
      });
      return;
    }

    steamrequest
      .steamMicrotransactionGetUserInfo(steamId)
      .then(data => {
        const success =
          data.response.result == 'OK' &&
          (data.response.params.status == 'Active' || data.response.params.status == 'Trusted');
        res.status(200).json({
          success,
        });
      })
      .catch(err => {
        res.status(500).json({ error: err.message || 'Something went wrong' });
      });
  },
  initPurchase: (req: Request, res: Response): void => {
    const params: ISteamOpenTransaction = <ISteamOpenTransaction>{ ...req.body };

    if (
      !params.appId ||
      !params.category ||
      !params.currency ||
      !params.itemDescription ||
      !params.itemId ||
      !params.orderId ||
      !params.steamId
    ) {
      res.status(400).json({
        error: 'Missing fields',
      });
      return;
    }

    steamrequest
      .steamMicrotransactionInitWithOneItem(params)
      .then(data => {
        if (data.response.result == 'OK' && data.response.params.transid) {
          res.status(200).json({ transid: data.response.params.transid });
        } else {
          res.status(500).json({ error: 'Something went wrong with the steam partner api' });
        }
      })
      .catch(err => {
        res.status(500).json({ error: err.message || 'Something went wrong' });
      });
  },
  checkPurchaseStatus: (req: Request, res: Response): void => {
    const params: ISteamTransaction = <ISteamTransaction>{ ...req.body };
    if (!params.appId || !params.orderId || !params.transId) {
      res.status(400).json({
        error: 'Missing fields',
      });
      return;
    }

    steamrequest
      .steamMicrotransactionCheckRequest(params)
      .then(data => {
        if (data.response.result == 'OK')
          res.status(200).json({ success: true, ...data.response.params });
        else res.status(500).json({ error: 'Something went wrong on the Steam API' });
      })
      .catch(err => {
        res.status(500).json({ error: err.message || 'Something went wrong' });
      });
  },
  finalizePurchase: (req: Request, res: Response): void => {
    const { orderId, appId } = req.body;
    if (!orderId || !appId) {
      res.status(400).json({
        error: 'Missing fields',
      });
      return;
    }

    steamrequest
      .steamMicrotransactionFinalizeTransaction(orderId, appId)
      .then(data => {
        res.status(200).json({
          success: data.response.result == 'OK',
        });
      })
      .catch(err => {
        res.status(500).json({ error: err.message || 'Something went wrong' });
      });
  },
};
