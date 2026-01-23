import steamController from './controllers/steam.controller';
import { Express, RequestHandler, Router } from 'express';

// Utility to handle missing fields in the request
const handleMissingFields = (fields: string[]) => (req, res, next) => {
  for (const field of fields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }
  next();
};

const validateGetReliableUserInfo: RequestHandler = handleMissingFields(['steamId', 'appId']);
const validateCheckAppOwnership: RequestHandler = handleMissingFields(['steamId', 'appId']);
const validateFinalizePurchase: RequestHandler = handleMissingFields(['appId', 'orderId']);
const validateCheckPurchaseStatus: RequestHandler = handleMissingFields([
  'appId',
  'orderId',
  'transId',
]);
const validateInitPurchase: RequestHandler = handleMissingFields([
  'appId',
  'category',
  'itemDescription',
  'itemId',
  'orderId',
  'steamId',
]);
const validateGetReport: RequestHandler = handleMissingFields(['appId', 'time']);
const validateGetUserAgreements: RequestHandler = handleMissingFields(['steamId', 'appId']);
const validateProcessAgreement: RequestHandler = handleMissingFields([
  'steamId',
  'agreementId',
  'appId',
  'orderId',
  'amount',
  'currency',
]);
const validateAdjustAgreement: RequestHandler = handleMissingFields([
  'steamId',
  'agreementId',
  'appId',
  'nextProcessDate',
]);
const validateCancelAgreement: RequestHandler = handleMissingFields([
  'steamId',
  'agreementId',
  'appId',
]);

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
  router.get('/', (_req, res) => {
    res.status(200).json({ status: true });
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
   * @apiParam  (json) {String} steamId User Steam ID
   * @apiParam  (json) {String} appId Steam App/Game ID
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
  router.post(
    '/GetReliableUserInfo',
    validateGetReliableUserInfo,
    steamController.getReliableUserInfo,
  );

  /**
   *
   * @api {post} /CheckAppOwnership Check if the user really owns the AppId
   * @apiName CheckAppOwnership
   * @apiGroup Microtransaction
   * @apiVersion  1.0.0
   * @apiDescription Return success:true if the user owns the app. Useful to prevent purchase from non-owners

   * @apiHeader {String} content-type application/json *required
   *
   * @apiParam  (json) {String} steamId User Steam ID
   * @apiParam  (json) {String} appId Steam App/Game ID
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
  router.post('/CheckAppOwnership', validateCheckAppOwnership, steamController.checkAppOwnership);

  /**
   *
   * @api {post} /InitPurchase Init Purchase
   * @apiName InitPurchase
   * @apiGroup Microtransaction
   * @apiVersion  1.0.0
   * @apiDescription Init the purchase process. After this call, the steam will popup a confirmation dialog in the game.

   * @apiHeader {String} content-type application/json *required
   *
   * @apiParam  (json) {String} appId string,
   * @apiParam  (json) {String} orderId number,
   * @apiParam  (json) {Integer} itemId number,
   * @apiParam  (json) {String} itemDescription string,
   * @apiParam  (json) {String} category string,
   * @apiParam  (json) {String} steamId User Steam ID
   *
   * @apiSuccess (Response: 200) {Boolean} transid Transaction Id
   *
   * @apiParamExample {json} Request-Example:
   * {
   *      appId: '480',
   *      itemId: 1001,
   *      itemDescription: 'abcd',
   *      category: 'gold',
   *      steamID: '765443152131231231',
   * }
   *
   * @apiSuccessExample {Object} Success-Response:
   * HTTP/1.1 200
   * {
   *     transid : "asdfglorenid",
   * }
   *
   */
  router.post('/InitPurchase', validateInitPurchase, steamController.initPurchase);

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
  router.post('/FinalizePurchase', validateFinalizePurchase, steamController.finalizePurchase);

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
  router.post(
    '/checkPurchaseStatus',
    validateCheckPurchaseStatus,
    steamController.checkPurchaseStatus,
  );

  /**
   *
   * @api {post} /GetReport Get Transaction Report
   * @apiName GetReport
   * @apiGroup Reports
   * @apiVersion  1.0.0
   * @apiDescription Get sales/transaction reports
   *
   * @apiHeader {String} content-type application/json *required
   *
   * @apiParam  (json) {String} appId Steam App Id
   * @apiParam  (json) {String} time Start time in RFC 3339 UTC format
   * @apiParam  (json) {String} [type] Report type: GAMESALES, STEAMSTORESALES, SETTLEMENT, CHARGEBACK, SUBSCRIPTION
   * @apiParam  (json) {Number} [maxResults] Max results (default 1000, max 50000)
   *
   * @apiSuccess (Response: 200) {Boolean} success
   * @apiSuccess (Response: 200) {Array} orders Transaction list
   */
  router.post('/GetReport', validateGetReport, steamController.getReport);

  /**
   *
   * @api {post} /GetUserAgreements Get User Agreements
   * @apiName GetUserAgreements
   * @apiGroup Subscriptions
   * @apiVersion  1.0.0
   * @apiDescription Get user's billing agreements (subscriptions)
   *
   * @apiHeader {String} content-type application/json *required
   *
   * @apiParam  (json) {String} steamId User Steam ID
   * @apiParam  (json) {String} appId Steam App Id
   *
   * @apiSuccess (Response: 200) {Boolean} success
   * @apiSuccess (Response: 200) {Array} agreements User's subscription agreements
   */
  router.post('/GetUserAgreements', validateGetUserAgreements, steamController.getUserAgreements);

  /**
   *
   * @api {post} /ProcessAgreement Process Recurring Charge
   * @apiName ProcessAgreement
   * @apiGroup Subscriptions
   * @apiVersion  1.0.0
   * @apiDescription Process a recurring subscription charge
   *
   * @apiHeader {String} content-type application/json *required
   *
   * @apiParam  (json) {String} steamId User Steam ID
   * @apiParam  (json) {String} agreementId Agreement ID
   * @apiParam  (json) {String} appId Steam App Id
   * @apiParam  (json) {String} orderId Order ID
   * @apiParam  (json) {Number} amount Amount in cents
   * @apiParam  (json) {String} currency ISO 4217 currency code
   *
   * @apiSuccess (Response: 200) {Boolean} success
   * @apiSuccess (Response: 200) {String} transid Transaction ID
   */
  router.post('/ProcessAgreement', validateProcessAgreement, steamController.processAgreement);

  /**
   *
   * @api {post} /AdjustAgreement Adjust Billing Date
   * @apiName AdjustAgreement
   * @apiGroup Subscriptions
   * @apiVersion  1.0.0
   * @apiDescription Adjust the next billing date for a subscription
   *
   * @apiHeader {String} content-type application/json *required
   *
   * @apiParam  (json) {String} steamId User Steam ID
   * @apiParam  (json) {String} agreementId Agreement ID
   * @apiParam  (json) {String} appId Steam App Id
   * @apiParam  (json) {String} nextProcessDate Next billing date (YYYYMMDD)
   * @apiParam  (json) {String} [oldNextProcessDate] Previous date for verification
   *
   * @apiSuccess (Response: 200) {Boolean} success
   * @apiSuccess (Response: 200) {String} agreementid Agreement ID
   */
  router.post('/AdjustAgreement', validateAdjustAgreement, steamController.adjustAgreement);

  /**
   *
   * @api {post} /CancelAgreement Cancel Subscription
   * @apiName CancelAgreement
   * @apiGroup Subscriptions
   * @apiVersion  1.0.0
   * @apiDescription Cancel a billing agreement (subscription)
   *
   * @apiHeader {String} content-type application/json *required
   *
   * @apiParam  (json) {String} steamId User Steam ID
   * @apiParam  (json) {String} agreementId Agreement ID
   * @apiParam  (json) {String} appId Steam App Id
   *
   * @apiSuccess (Response: 200) {Boolean} success
   * @apiSuccess (Response: 200) {String} agreementid Agreement ID
   */
  router.post('/CancelAgreement', validateCancelAgreement, steamController.cancelAgreement);

  // Add router to the application
  app.use('/', router);

  // Error handling middleware
  app.use((err: any, _req, res, _next) => {
    res.status(500).json({
      error: 500,
      message: err.message || 'Something went wrong',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  });

  // 404 handling for unknown routes
  app.use((_req, res) => {
    res.status(404).send('');
  });
};
