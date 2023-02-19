import server from '@src/entrypoint';
import supertest from 'supertest';

let request: supertest.SuperTest<supertest.Test>;

describe('API health status', () => {
  beforeAll(() => {
    const [expressServer] = server;

    request = supertest(expressServer);
  });

  it('Should be online', async () => {
    const res = await request.get('/');

    expect(res.body).toHaveProperty('status');
  });

  afterAll(() => {
    const [, httpServer] = server;
    httpServer.close();
  });
});
