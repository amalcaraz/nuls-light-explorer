import { NextFunction, Request, Response } from 'express';
import * as domain from '../domain/explorer';
import { txHash } from '../models';

export async function getBlockController(req: Request, res: Response, next: NextFunction) {

  const height: number = parseInt(req.params.height);

  return domain
    .getBlock(height)
    .then((response: any) => res.send(response))
    .catch(next);

}

export async function broadcastTransactionController(req: Request, res: Response, next: NextFunction) {

  return domain
    .broadcastTransaction(req.body)
    .then((response: txHash) => res.send(response))
    .catch(next);

}
