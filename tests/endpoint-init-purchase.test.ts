import controllers from '../src/api/controllers/steam.controller';
import { getMockReq, getMockRes } from '@jest-mock/express';

import {
  MockedRequestWithSteam,
  VALID_USER_STEAM_ID,
  mockSteamApiPost,
  mockedSteamRequest,
} from './utils';

import microTxInitTransactionFailedMock from './mock/micro-tx-init-transaction-failed-mock.json';
import microTxInitTransactionSuccessMock from './mock/micro-tx-init-transaction-success-mock.json';

describe('Controller Test: /InitPurchase', () => {
  const body = {
    appId: '480',
    orderId: 1000,
    amount: 199,
    itemId: 1001,
    itemDescription: 'abcd',
    category: 'gold',
    steamId: VALID_USER_STEAM_ID,
  };

  it('Should request to init the purchase process', async () => {
    mockSteamApiPost.mockReturnValueOnce(Promise.resolve(microTxInitTransactionSuccessMock));

    const req = getMockReq<MockedRequestWithSteam>({
      steam: mockedSteamRequest,
      body,
    });
    const { res } = getMockRes();
    await controllers.initPurchase(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ transid: 'example-return-transaction-id' })
    );
  });
  it('Should request to init the purchase process', async () => {
    mockSteamApiPost.mockReturnValueOnce(Promise.resolve(microTxInitTransactionFailedMock));

    const req = getMockReq<MockedRequestWithSteam>({
      steam: mockedSteamRequest,
      body,
    });
    const { res } = getMockRes();
    await controllers.initPurchase(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Something went wrong with the steam partner api' })
    );
  });
});
