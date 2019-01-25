import { NextFunction, Request, Response } from 'express';
import * as domain from '../domain/explorer';
import { txHash } from '../models';

export async function broadcastTransactionController(req: Request, res: Response, next: NextFunction) {

  return domain
    .broadcastTransaction(req.body)
    .then((response: txHash) => res.send(response))
    .catch(next);

}
