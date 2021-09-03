import * as dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';

import SteamRequest from '@src/steam/steamrequest';
import httpclient from '@src/lib/httpclient';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      steam: SteamRequest;
    }
  }
}

export default (app: Express, host: string, port: number | string): Express => {
  const corsOptions = {
    origin: ['*'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    optionsSuccessStatus: 200,
  };

  // cors
  app.use(cors(corsOptions));

  // helmet
  app.use(helmet());

  // disable powered by
  app.disable('x-powered-by');

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((_req, _res, next) => {
    _req.steam = new SteamRequest(httpclient);
    next();
  });

  // setting routes
  routes(app);

  // morgan
  app.use(morgan);

  // start the app
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server ${host} started at port:${port}`);
  });

  return app;
};
