import { Router as ExpressRouter } from 'express';
import { validate } from 'express-jsonschema';
import { readFileSync } from 'fs';
import * as path from 'path';
import { broadcastTransactionController, getBlockController, getTransactionController, getUtxosController, getBalanceController, getLastHeightController } from '../controllers/explorer';
import contractRouter from './contract';

export const router = ExpressRouter();

const schemaPath: string = path.normalize(__dirname + '/../../../schemas');
const broadcastTransactionSchema = JSON.parse(readFileSync(schemaPath + '/broadcastTransaction.json', 'utf-8'));

router
  .get('/last-height', getLastHeightController)
  .get('/block/:hashOrHeight', getBlockController)
  .get('/transaction/:hash', getTransactionController)
  .get('/utxos/:address', getUtxosController)
  .get('/balance/:address', getBalanceController)
  .post('/broadcast', validate({ body: broadcastTransactionSchema }), broadcastTransactionController)
  .use('/contract', contractRouter);

export default router;