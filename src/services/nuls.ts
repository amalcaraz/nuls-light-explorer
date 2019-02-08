import * as request from 'request-promise-native';
import config from './config';
import { error } from '../utils/error';
import { txHash } from '../models';
import { NulsResponse, NulsBlockHeader, NulsBlockHeaderResponse } from '../models/nuls';
import { ContractMethodsResponse, ContractViewResponse, ContractViewRequest } from '../models/contract';

const api: string = `${config.nuls.host}${config.nuls.base}`;

export async function getLastHeight(): Promise<number> {

  const url: string = `${api}${config.nuls.resources.getLastHeight}`;
  let response: NulsResponse;

  try {

    response = await request.get(url, { json: true });

  } catch (e) {

    throw error(e);

  }

  return response.data.value;

}

export async function getBlockHeader(height: number): Promise<NulsBlockHeader> {

  const url: string = `${api}${config.nuls.resources.getBlock}`.replace('__BLOCK_HEIGHT__', height.toString());
  let response: NulsBlockHeaderResponse;

  try {

    response = await request.get(url, { json: true });

  } catch (e) {

    throw error(e);

  }

  return response.data;

}

export async function getBlockBytes(blockHash: string): Promise<string> {

  const url: string = `${api}${config.nuls.resources.getBlockBytes}`.replace('__BLOCK_HASH__', blockHash);
  let response: NulsResponse;

  try {

    response = await request.get(url, { json: true });

  } catch (e) {

    throw error(e);

  }

  return response.data.value;

}

export async function contractMethods(address: string): Promise<ContractMethodsResponse> {

  const url: string = `${api}${config.nuls.resources.contractInfo}`.replace('__ADDRESS__', address);
  let response: NulsResponse;

  try {

    response = await request.get(url, { json: true });

  } catch (e) {

    throw error(e);

  }

  return response.data.method;

}

// TODO: some errors are returned as 200 OK from node api (map them throwing errors)
export async function contractView(body: ContractViewRequest): Promise<ContractViewResponse> {

  const url: string = `${api}${config.nuls.resources.contractView}`;
  let response: NulsResponse;

  try {

    response = await request.post(url, {
      json: true,
      body,
    });

  } catch (e) {

    throw error(e);

  }

  return response.data;

}

export async function broadcastTransaction(txHex: string): Promise<txHash> {

  const url: string = `${api}${config.nuls.resources.broadcastTx}`;
  let response: NulsResponse;

  try {

    response = await request.post(url, {
      body: { txHex },
      json: true,
    });

  } catch (e) {

    throw error(e);

  }

  return response.data;

}
