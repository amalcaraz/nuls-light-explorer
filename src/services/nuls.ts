import * as request from 'request-promise-native';
import config from './config';
import { error } from '../utils/error';
import { txHash } from '../models';
import { NulsResponse, NulsBlockHeader, NulsBlockHeaderResponse } from '../models/nuls';

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
