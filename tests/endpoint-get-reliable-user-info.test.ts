import controllers from '../src/api/controllers/steam.controller';
import { getMockReq, getMockRes } from '@jest-mock/express';

import {
  MockedRequestWithSteam,
  VALID_USER_STEAM_ID,
  mockSteamApiGet,
  mockedSteamRequest,
} from './utils';

import microTxGetUserInfoMock from './mock/micro-tx-get-user-info-success-mock.json';

describe('Controller Test: /GetReliableUserInfo', () => {
  it('Should return a valid user info', async () => {
    mockSteamApiGet.mockReturnValueOnce(Promise.resolve(microTxGetUserInfoMock));

    const req = getMockReq<MockedRequestWithSteam>({
      steam: mockedSteamRequest,
      body: {
        steamId: VALID_USER_STEAM_ID,
      },
    });
    const { res } = getMockRes();
    await controllers.getReliableUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });
});
