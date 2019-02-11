import { ContractMethodsResponse, ContractViewRequest, ContractViewResponse, ContractCallValidateRequest, ContractCallGasRequest, ContractCallValidateResponse, ContractCallGasResponse } from '../models/contract';
import * as nulsService from '../services/nuls';
import { nulsContractMethodsError, nulsContractViewError, nulsContractCallValidateError, nulsContractCallGasError } from './error';
import { error } from '../utils/error';
import { MAX_GAS_LIMIT } from '../models/common';

export async function contractMethods(address: string): Promise<ContractMethodsResponse> {

  try {

    return await nulsService.contractMethods(address);

  } catch (e) {

    throw error(nulsContractMethodsError, e);

  }

}

export async function contractView(params: ContractViewRequest): Promise<ContractViewResponse> {

  try {

    return await nulsService.contractView(params);

  } catch (e) {

    throw error(nulsContractViewError, e);

  }

}

export async function contractCallValidate(params: ContractCallValidateRequest): Promise<ContractCallValidateResponse> {

  try {

    params.gasLimit = params.gasLimit || MAX_GAS_LIMIT;
    return await nulsService.contractCallValidate(params);

  } catch (e) {

    throw error(nulsContractCallValidateError, e);

  }

}

export async function contractCallGas(params: ContractCallGasRequest): Promise<ContractCallGasResponse> {

  try {

    return await nulsService.contractCallGas(params);

  } catch (e) {

    throw error(nulsContractCallGasError, e);

  }

}
