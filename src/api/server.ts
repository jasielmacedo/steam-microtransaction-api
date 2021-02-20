import bodyParser from 'body-parser';
import cors from 'cors';
import Debug from 'debug';
import { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';

const Log = Debug('server');

export default (app: Express, host: string, port: number | string) => {
  const corsOptions = {
    origin: ['*'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    optionsSuccessStatus: 200,
  };

  // cors
  app.use(cors(corsOptions));

  // helmet
  app.use(helmet());

  // bodyParser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // disable powered by
  app.disable('x-powered-by');

  // setting routes
  routes(app);

  // morgan
  app.use(morgan);

  // start the app
  app.listen(port, () => {
    Log(`Server ${host} started at port:${port}`);
  });

  return app;
};
