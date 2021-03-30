import steamController from './controllers/steam.controller';
import { Express, NextFunction, Request, Response, Router } from 'express';

export default (app: Express): void => {
  const router = Router();

  /**
   *
   * @api {get} / Initial route to check API Status
   * @apiName Health
   * @apiGroup Status
   * @apiVersion  1.0.0
   *
   * @apiSuccess (Response: 200) {Boolean} success returns true if everything is ok
   *
   * @apiSuccessExample {Object} Success-Response:
   * HTTP/1.1 200
   * {
   *     status : boolean
   * }
   */
  router.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      status: true,
    });
  });

  /**
     * 
     * @api {post} /GetReliableUserInfo Get Reliable User Info
     * @apiName GetReliableUserInfo
     * @apiGroup Microtransaction
     * @apiVersion  1.0.0
     * @apiDescription Check if the user is reliable to start purchase. Return true if user is reliable

     * @apiHeader {String} content-type application/json *required
     * 
     * @apiParam  (json) {String} steamId New password
     * @apiParam  (json) {String} appId Old Password
     * 
     * @apiSuccess (Response: 200) {Boolean} success Response Status
     * 
     * @apiSuccessExample {Object} Success-Response:
     * HTTP/1.1 200
     * {
     *     success : true,
     * }
     * 
     */
  router.post('/GetReliableUserInfo', steamController.getReliableUserInfo);

  /**
     * 
     * @api {post} /InitPurchase Init Purchase
     * @apiName InitPurchase
     * @apiGroup Microtransaction
     * @apiVersion  1.0.0
     * @apiDescription Init the purchase process. After this call, the steam will popup an confirmation dialog in the game.

     * @apiHeader {String} content-type application/json *required
     * 
     * @apiParam  (json) {String} appId string,
     * @apiParam  (json) {String} orderId string,
     * @apiParam  (json) {String} currency number, 
     * @apiParam  (json) {String} itemId string,
     * @apiParam  (json) {String} itemDescription string,
     * @apiParam  (json) {String} category string,
     * 
     * @apiSuccess (Response: 200) {Boolean} transid Transaction Id
     * 
     * @apiParamExample {json} Request-Example:
     * {
     *      appId: '480',
     *      orderId: '1',
     *      currency: 199, 
     *      itemId: 'abc',
     *      itemDescription: 'abcd',
     *      category: 'gold',
     * }
     * 
     * @apiSuccessExample {Object} Success-Response:
     * HTTP/1.1 200
     * {
     *     transid : "asdfglorenid",
     * }
     * 
     */
  router.post('/InitPurchase', steamController.initPurchase);

  /**
     * 
     * @api {post} /FinalizePurchase Finalize Purchase
     * @apiName FinalizePurchase
     * @apiGroup Microtransaction
     * @apiVersion  1.0.0
     * @apiDescription Finalize the transaction. See https://partner.steamgames.com/doc/webapi/ISteamMicroTxn#FinalizeTxn

     * @apiHeader {String} content-type application/json *required
     * 
     * @apiParam  (json) {String} appId Steam App Id
     * @apiParam  (json) {String} orderId Order Id saved 
     * 
     * @apiSuccess (Response: 200) {Boolean} success Return true if the transaction was finished successfully
     * 
     * @apiSuccessExample {Object} Success-Response:
     * HTTP/1.1 200
     * {
     *     success : true,
     * }
     * 
     */
  router.post('/FinalizePurchase', steamController.finalizePurchase);

  /**
     * 
     * @api {post} /CheckPurchaseStatus Check Purchase Status
     * @apiName CheckPurchaseStatus
     * @apiGroup Microtransaction
     * @apiVersion  1.0.0
     * @apiDescription Retrieve the current status of the purchase

     * @apiHeader {String} content-type application/json *required
     * 
     * @apiParam  (json) {String} appId Steam App Id
     * @apiParam  (json) {String} orderId Order Id 
     * @apiParam  (json) {String} transId Transaction Id 
     * 
     * @apiSuccess (Response: 200) {Boolean} success 
     * @apiSuccess (Response: 200) {Json} fields Retrieve Transaction Data 
     * 
     * @apiSuccessExample {Object} Success-Response:
     * HTTP/1.1 200
     * {
     *     success : true,
     *     orderid : string,
     *     transid : string,
     *     steamid : string,
     *     status : string,
     *     currency: string
     *     time: string,
     *     country: string,
     *     usstate: string,
     *     items: [{
     *          itemid : string,
     *          qty : number,
     *          amount : string,
     *          vat : string,
     *          itemstatus : string,
     *     }]
     * }
     * 
     */
  router.post('/CheckPurchaseStatus', steamController.checkPurchaseStatus);

  app.use('/', router);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((_err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({
      error: 500,
      message: _err.message || 'Something went wrong',
    });
  });

  app.use((_req: Request, res: Response) => {
    res.status(403).send('');
  });
};
