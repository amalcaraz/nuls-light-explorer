import * as nulsService from '../services/nuls';
import { error } from '../utils/error';
import { nulsBroadcastTransactionError, nulsGetTransactionByHashError, nulsGetLastHeightError } from './error';
import { txHash, Transaction } from '../models';
import * as levelDb from '../db/level';

export {
  getBlockByHeight,
  getBlockByHash,
  getFullBlockByHeight,
  getFullBlockByHash
} from './block';

export {
  getUtxos,
  getBalance
} from './utxos';

export async function getLastHeight(): Promise<[number]> {

  try {

    // return [await nulsService.getLastHeight()];
    return [await levelDb.getLastBlockHeight().catch(() => -1)];

  } catch (e) {

    throw error(nulsGetLastHeightError, e);

  }

}

export async function getTransaction(hash: string): Promise<Transaction> {

  try {

    return await levelDb.getTransaction(hash);

  } catch (e) {

    throw error(nulsGetTransactionByHashError, e);

  }

}

export async function broadcastTransaction(txHex: string): Promise<txHash> {

  try {

    return await nulsService.broadcastTransaction(txHex);

  } catch (e) {

    throw error(nulsBroadcastTransactionError, e);

  }

}
