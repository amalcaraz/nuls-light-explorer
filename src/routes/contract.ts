import { Router as ExpressRouter } from 'express';
import { validate } from 'express-jsonschema';
import { readFileSync } from 'fs';
import * as path from 'path';
import { contractMethodsController, contractViewController } from '../controllers/contract';

export const router = ExpressRouter();

const schemaPath: string = path.normalize(__dirname + '/../../../schemas');
const contractViewSchema = JSON.parse(readFileSync(schemaPath + '/contractView.json', 'utf-8'));

router
  .get('/:contract/methods', contractMethodsController)
  .post('/:contract/view', validate({ body: contractViewSchema }), contractViewController);

export default router;