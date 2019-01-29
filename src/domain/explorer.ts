import * as nulsService from '../services/nuls';
import { error } from '../utils/error';
import { nulsBroadcastTransactionError, nulsGetBlockError } from './error';
import { txHash } from '../models';
import * as levelDb from '../db/level';
import { BlockObject } from 'nuls-js';

export async function getBlock(height: number): Promise<BlockObject> {

  try {

    return await levelDb.getBlock(height);

  } catch (e) {

    throw error(nulsGetBlockError, e);

  }

}

export async function broadcastTransaction(txHex: string): Promise<txHash> {

  try {

    return await nulsService.broadcastTransaction(txHex);

  } catch (e) {

    throw error(nulsBroadcastTransactionError, e);

  }

}
