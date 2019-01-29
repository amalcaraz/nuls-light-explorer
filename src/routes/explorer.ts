import { Router as ExpressRouter } from 'express';
import { validate } from 'express-jsonschema';
import { readFileSync } from 'fs';
import * as path from 'path';
import { broadcastTransactionController, getBlockController } from '../controllers/explorer';

export const router = ExpressRouter();

const schemaPath: string = path.normalize(__dirname + '/../../../schemas');
const broadcastTransactionSchema = JSON.parse(readFileSync(schemaPath + '/broadcastTransaction.json', 'utf-8'));

router
  .get('/block/:height', getBlockController)
  .post('/broadcast', validate({ body: broadcastTransactionSchema }), broadcastTransactionController);

export default router;