import { NextFunction, Request, Response } from 'express';
import * as domain from '../domain/explorer';
import { isHash } from '../utils/utils';

export async function getBlockController(req: Request, res: Response, next: NextFunction) {

  const hashOrHeight: string = req.params.hashOrHeight;

  if (!isHash(hashOrHeight)) {

    const height: number = parseInt(hashOrHeight);

    return domain
      .getBlockByHeight(height)
      .then(res.send.bind(res))
      .catch(next);

  } else {

    return domain
      .getBlockByHash(hashOrHeight)
      .then(res.send.bind(res))
      .catch(next);

  }

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
