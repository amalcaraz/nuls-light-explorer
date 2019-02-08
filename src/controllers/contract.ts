import { NextFunction, Request, Response } from 'express';
import * as domain from '../domain/contract';
import { ContractViewRequest } from '../models/contract';

export async function contractMethodsController(req: Request, res: Response, next: NextFunction) {

  const address: string = req.params.contract;

  return domain
    .contractMethods(address)
    .then(res.send.bind(res))
    .catch(next);

}

export async function contractViewController(req: Request, res: Response, next: NextFunction) {

  const body: ContractViewRequest = {
    ...req.body,
    contractAddress: req.params.contract
  };

  return domain
    .contractView(body)
    .then(res.send.bind(res))
    .catch(next);

}
