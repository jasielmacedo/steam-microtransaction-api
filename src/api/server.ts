import { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';

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
    // eslint-disable-next-line no-console
    console.log(`Server ${host} started at port:${port}`);
  });

  return app;
};
