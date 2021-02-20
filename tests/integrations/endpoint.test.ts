import supertest from 'supertest';
import server from '@src/entrypoint';

const request = supertest(server);

describe('API endpoints', () => {
  it('Should be online', async () => {
    const res = await request.get('/');

    expect(res.body).toHaveProperty('status');
  });
});
