import controllers from '../src/api/controllers/steam.controller';
import { getMockReq, getMockRes } from '@jest-mock/express';

import {
  MockedRequestWithSteam,
  VALID_USER_STEAM_ID,
  mockSteamApiGet,
  mockedSteamRequest,
} from './utils';

import checkAppOwnershipSuccessMock from './mock/check-app-ownership-success-mock.json';

describe('Controller Test: /CheckAppOwnership', () => {
  it('Should return if the user owns', async () => {
    mockSteamApiGet.mockReturnValueOnce(Promise.resolve(checkAppOwnershipSuccessMock));

    const req = getMockReq<MockedRequestWithSteam>({
      steam: mockedSteamRequest,
      body: {
        steamId: VALID_USER_STEAM_ID,
        appId: '480',
      },
    });
    const { res } = getMockRes();
    await controllers.checkAppOwnership(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });
});
