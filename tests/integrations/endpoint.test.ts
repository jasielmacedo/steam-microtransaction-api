import server from '@src/entrypoint';
import supertest from 'supertest';

const request = supertest(server);

describe('API endpoints', () => {
  it('Should be online', async () => {
    const res = await request.get('/');

    expect(res.body).toHaveProperty('status');
  });
});
