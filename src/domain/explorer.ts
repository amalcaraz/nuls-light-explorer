import * as nulsService from '../services/nuls';
import { error } from '../utils/error';
import { nulsBroadcastTransactionError, nulsGetBlockByHeightError, nulsGetBlockByHashError, nulsGetTransactionByHashError } from './error';
import { txHash, Block, Transaction } from '../models';
import * as levelDb from '../db/level';

export async function getBlockByHeight(height: number): Promise<Block> {

  try {

    return await levelDb.getBlock(height);

  } catch (e) {

    throw error(nulsGetBlockByHeightError, e);

  }

}

export async function getBlockByHash(hash: string): Promise<Block> {

  try {

    const height: number = await levelDb.getBlockHeightByHash(hash);
    return await levelDb.getBlock(height);

  } catch (e) {

    throw error(nulsGetBlockByHashError, e);

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
