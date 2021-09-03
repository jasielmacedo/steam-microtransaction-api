import SteamRequest from '@src/steam/steamrequest';

import { Request } from 'express';

export const VALID_USER_STEAM_ID = '712313612361231236';

export const mockSteamApiGet = jest.fn();
export const mockSteamApiPost = jest.fn();

const mockHttpClient = {
  get: mockSteamApiGet,
  post: mockSteamApiPost,
};

export interface MockedRequestWithSteam extends Request {
  steam: SteamRequest;
}

export const mockedSteamRequest = new SteamRequest(mockHttpClient);
