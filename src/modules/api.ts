import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { appRouter } from '../routes/index';
import config from '../services/config';
import logger from '../services/logger';

export function run(): express.Application {

  const app: express.Application = express();

  app.use(cors());
  app.use(bodyParser.json());

  app.use(appRouter);

  app.listen(config.server.port, (error: Error) => {

    if (error) {
      return logger.error('Service is not available', error);
    }

    logger.info('Service available in port', config.server.port);

  });

  return app;

}

export default run;
