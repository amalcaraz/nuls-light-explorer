import { NextFunction, Request, Response } from 'express';
import * as domain from '../domain/explorer';
import { isHash } from '../utils/utils';

export async function getBlockController(req: Request, res: Response, next: NextFunction) {

  const hashOrHeight: string = req.params.hashOrHeight;
  const fullBlock: boolean = req.query.full ? true : false;
  let response: Promise<any>;

  if (!isHash(hashOrHeight)) {

    const height: number = parseInt(hashOrHeight);

    response = fullBlock ? domain.getFullBlockByHeight(height) : domain.getBlockByHeight(height)

  } else {

    response = fullBlock ? domain.getFullBlockByHash(hashOrHeight) : domain.getBlockByHash(hashOrHeight)

  }

  return response
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

export async function getUtxosController(req: Request, res: Response, next: NextFunction) {

  const address: string = req.params.address;

  return domain
    .getUtxos(address)
    .then(res.send.bind(res))
    .catch(next);

}

export async function getBalanceController(req: Request, res: Response, next: NextFunction) {

  const address: string = req.params.address;

  return domain
    .getBalance(address)
    .then(res.send.bind(res))
    .catch(next);

}

export async function broadcastTransactionController(req: Request, res: Response, next: NextFunction) {

  return domain
    .broadcastTransaction(req.body.txHex)
    .then(res.send.bind(res))
    .catch(next);

}
