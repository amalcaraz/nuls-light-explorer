import * as request from 'request-promise-native';
import config from './config';
import { error } from '../utils/error';

const api: string = `${config.nuls.host}${config.nuls.base}`;

export interface INulsResponse {
  success: boolean;
}

export async function getLastHeight(): Promise<number> {

  const url: string = `${api}${config.nuls.resources.getLastHeight}`;
  let lastHeight: number;

  try {

    lastHeight = await request.get(url);

  } catch (e) {

    throw error(e);

  }

  return lastHeight;

}

export async function broadcastTransaction(txHex: string): Promise<INulsResponse> {

  const url: string = `${api}${config.nuls.resources.broadcastTx}`;
  let response: INulsResponse;

  try {

    response = await request.post(url, {
      body: { txHex },
      json: true,
    });

  } catch (e) {

    throw error(e);

  }

  return response;

}
