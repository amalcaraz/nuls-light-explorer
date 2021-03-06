import * as request from 'request-promise-native';
import config from './config';
import { error } from '../utils/error';
import { txHash } from '../models';
import { NulsResponse, NulsBlockHeader, NulsBlockHeaderResponse, NulsNetInfo, NulsClientVersion } from '../models/nuls';
import { ContractMethodsResponse, ContractViewResponse, ContractViewRequest, ContractCallGasRequest, ContractCallValidateRequest, ContractCallValidateResponse, ContractCallGasResponse } from '../models/contract';

const api: string = `${config.nuls.host}${config.nuls.base}`;

export async function getClientVersion(): Promise<NulsClientVersion> {

  const url: string = `${api}${config.nuls.resources.version}`;
  let response: NulsResponse;

  try {

    response = await request.get(url, { json: true });

    check200Error(response);

  } catch (e) {

    throw error(e);

  }

  return response.data;

}

export async function getNetInfo(): Promise<NulsNetInfo> {

  const url: string = `${api}${config.nuls.resources.info}`;
  let response: NulsResponse;

  try {

    response = await request.get(url, { json: true });

    check200Error(response);

  } catch (e) {

    throw error(e);

  }

  return response.data;

}

export async function getLastHeight(): Promise<number> {

  const url: string = `${api}${config.nuls.resources.getLastHeight}`;
  let response: NulsResponse;

  try {

    response = await request.get(url, { json: true });

    check200Error(response);

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

    check200Error(response);

  } catch (e) {

    throw error(e);

  }

  return response.data;

}

export async function getBlockBytes(height: number): Promise<string>;
export async function getBlockBytes(hash: string): Promise<string>;
export async function getBlockBytes(heightOrHash: number | string): Promise<string> {

  let url: string;

  if (typeof heightOrHash === 'string') {

    url = `${api}${config.nuls.resources.getBlockBytesByHash}`.replace('__BLOCK_HASH__', heightOrHash);

  } else {

    url = `${api}${config.nuls.resources.getBlockBytes}`.replace('__BLOCK_HEIGHT__', `${heightOrHash}`);

  }

  let response: NulsResponse;

  try {

    response = await request.get(url, { json: true });

    check200Error(response);

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

    check200Error(response);

  } catch (e) {

    throw error(e);

  }

  return response.data.method;

}

export async function contractView(body: ContractViewRequest): Promise<ContractViewResponse> {

  const url: string = `${api}${config.nuls.resources.contractView}`;
  let response: NulsResponse;

  try {

    response = await request.post(url, {
      json: true,
      body,
    });

    check200Error(response);

  } catch (e) {

    throw error(e);

  }

  return response.data;

}

export async function contractCallValidate(body: ContractCallValidateRequest): Promise<ContractCallValidateResponse> {

  const url: string = `${api}${config.nuls.resources.contractCallValidate}`;
  let response: NulsResponse;

  try {

    response = await request.post(url, {
      json: true,
      body,
    });

    check200Error(response);

  } catch (e) {

    throw error(e);

  }

  return { isValid: response.success };

}

export async function contractCallGas(body: ContractCallGasRequest): Promise<ContractCallGasResponse> {

  const url: string = `${api}${config.nuls.resources.contractCallGas}`;
  let response: NulsResponse;

  try {

    response = await request.post(url, {
      json: true,
      body,
    });

    check200Error(response);

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

    check200Error(response);

  } catch (e) {

    throw error(e);

  }

  return response.data;

}

function check200Error(response: NulsResponse) {
  if (response.data && response.data.code) {
    throw new Error(`${response.data.code}::${response.data.msg}`);
  }
}
