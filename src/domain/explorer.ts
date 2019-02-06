import * as nulsService from '../services/nuls';
import { error } from '../utils/error';
import { nulsBroadcastTransactionError, nulsGetTransactionByHashError } from './error';
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
