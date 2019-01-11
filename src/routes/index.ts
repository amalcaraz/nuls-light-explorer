import { Router } from 'express';

import { errorController } from '../controllers/error';
import { fallbackController } from '../controllers/fallback';
import { healthCheckController } from '../controllers/healthcheck';
import explorerRouter from './explorer';
import { jsonSchemaError } from '../controllers/jsonSchemaError';

export const appRouter = Router();

appRouter
  .use('/health', healthCheckController)
  .use(explorerRouter)
  .use(fallbackController)
  .use(jsonSchemaError)
  .use(errorController);
