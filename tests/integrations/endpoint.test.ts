import server from '@src/entrypoint';
import supertest, { Test } from 'supertest';

import { Server } from 'http';
import TestAgent from 'supertest/lib/agent';

let request: TestAgent<Test>;
let httpServer: Server;

describe('API health status', () => {
  beforeAll(() => {
    const [expressServer, serverListener] = server;
    request = supertest(expressServer);
    httpServer = serverListener;
  });

  it('Should be online', async () => {
    const res = await request.get('/');
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe(true);
  });

  afterAll(() => {
    httpServer.close();
  });
});
