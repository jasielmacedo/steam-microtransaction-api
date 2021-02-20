import steamrequest from '@src/steam/steamrequest';
import constants from '@src/constants';

describe('Testing steam integration', () => {
  it('Check app ownership', async done => {
    const result = await steamrequest.steamCheckAppOwnership({
      steamId: constants.steamId,
      appId: constants.appId,
    });
    expect(result.ownsapp).toBe(true);
    done();
  });

  it('Check if the user is reliable', async done => {
    const result = await steamrequest.steamMicrotransactionGetUserInfo(constants.steamId);
    console.log(result);
    done();
  });
});
