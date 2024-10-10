import * as dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express, { Express } from 'express';

import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';

import SteamRequest from '@src/steam/steamrequest';
import httpclient from '@src/lib/httpclient';
import { IncomingMessage, Server, ServerResponse } from 'http';

import hpp from 'hpp';
import xssClean from 'xss-clean';

import mongoSanitize from 'express-mongo-sanitize';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      steam: SteamRequest;
    }
  }
}

export default (
  app: Express,
  host: string,
  port: number | string
): [Express, Server<typeof IncomingMessage, typeof ServerResponse>] => {
  // Trust the reverse proxy (important for Heroku and rate limiting)
  app.set('trust proxy', 1);
  // CORS options
  const corsOptions = {
    origin: ['*'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    optionsSuccessStatus: 200,
  };

  // Enable CORS
  app.use(cors(corsOptions));

  // Enable Helmet to add security-related HTTP headers
  app.use(helmet());

  // Disable 'X-Powered-By' to prevent attackers from knowing the framework
  app.disable('x-powered-by');

  // Enable rate limiting to prevent brute force attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use(limiter);

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Prevent Cross-site Scripting (XSS) attacks
  app.use(xssClean());

  // Prevent NoSQL Injection / Sanitize user input coming from POST body, GET queries, etc.
  app.use(mongoSanitize());

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Custom middleware to add SteamRequest to request object
  app.use((_req, _res, next) => {
    _req.steam = new SteamRequest(httpclient);
    next();
  });

  // Setting routes
  routes(app);

  // Enable request logging with Morgan
  app.use(morgan('combined'));

  // Start the server
  const serverListener = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server ${host} started at port:${port}`);
  });

  return [app, serverListener];
};
