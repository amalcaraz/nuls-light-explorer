import { NextFunction, Request, Response } from 'express';
import * as domain from '../domain/explorer';
import { IExplorerResponse } from '../domain/explorer';

export async function broadcastTransactionController(req: Request, res: Response, next: NextFunction) {

  return domain
    .broadcastTransaction(req.body)
    .then((response: IExplorerResponse) => res.send(response))
    .catch(next);

}
