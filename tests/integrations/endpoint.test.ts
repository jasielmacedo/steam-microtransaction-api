import server from '@src/entrypoint';
import supertest from 'supertest';

let request: supertest.SuperTest<supertest.Test>;

describe('API health status', () => {
  beforeAll(() => {
    request = supertest(server);
  });

  it('Should be online', async () => {
    const res = await request.get('/');

    expect(res.body).toHaveProperty('status');
  });
});
