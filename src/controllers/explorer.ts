import { NextFunction, Request, Response } from 'express';
import * as domain from '../domain/explorer';

export async function getBlockController(req: Request, res: Response, next: NextFunction) {

  const height: number = parseInt(req.params.height);

  return domain
    .getBlock(height)
    .then(res.send.bind(res))
    .catch(next);

}

export async function getTransactionController(req: Request, res: Response, next: NextFunction) {

  const hash: string = req.params.hash;

  return domain
    .getTransaction(hash)
    .then(res.send.bind(res))
    .catch(next);

}

export async function broadcastTransactionController(req: Request, res: Response, next: NextFunction) {

  return domain
    .broadcastTransaction(req.body)
    .then(res.send.bind(res))
    .catch(next);

}
