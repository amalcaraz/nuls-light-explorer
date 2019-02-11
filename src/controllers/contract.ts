import { NextFunction, Request, Response } from 'express';
import * as domain from '../domain/contract';
import { ContractViewRequest, ContractCallValidateRequest, ContractCallGasRequest } from '../models/contract';

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

export async function contractCallValidateController(req: Request, res: Response, next: NextFunction) {

  const body: ContractCallValidateRequest = {
    ...req.body,
    contractAddress: req.params.contract
  };

  return domain
    .contractCallValidate(body)
    .then(res.send.bind(res))
    .catch(next);

}

export async function contractCallGasController(req: Request, res: Response, next: NextFunction) {

  const body: ContractCallGasRequest = {
    ...req.body,
    contractAddress: req.params.contract
  };

  return domain
    .contractCallGas(body)
    .then(res.send.bind(res))
    .catch(next);

}
