import controllers from '../src/api/controllers/steam.controller';
import { getMockReq, getMockRes } from '@jest-mock/express';

import { MockedRequestWithSteam, mockSteamApiGet, mockedSteamRequest } from './utils';

import checkPurchaseStatusMock from './mock/check-purchase-status-success-mock.json';

describe('Controller Test: /CheckPurchaseStatus', () => {
  it('Should return if the user owns', async () => {
    mockSteamApiGet.mockReturnValueOnce(Promise.resolve(checkPurchaseStatusMock));

    const req = getMockReq<MockedRequestWithSteam>({
      steam: mockedSteamRequest,
      body: {
        orderId: 'fake-order-id',
        transId: 'example-transaction-id',
        appId: '480',
      },
    });
    const { res } = getMockRes();
    await controllers.checkPurchaseStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        orderid: 'FAKE-ORDER-ID',
        transid: 'FAKE-TRANSACTION-ID',
        steamid: 'FAKE-STEAM-ID',
        status: 'Init',
        currency: 'USD',
        time: '2021-01-01T00:00:00',
        country: 'BR',
        usstate: '',
        items: [
          {
            itemid: 10001,
            qty: 1,
            amount: '199',
            vat: '0',
            itemstatus: 'OK',
          },
        ],
      })
    );
  });
});
