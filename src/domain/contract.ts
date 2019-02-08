import { ContractMethodsResponse, ContractViewRequest, ContractViewResponse } from '../models/contract';
import * as nulsService from '../services/nuls';
import { nulsContractMethodsError, nulsContractViewError } from './error';
import { error } from '../utils/error';

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
