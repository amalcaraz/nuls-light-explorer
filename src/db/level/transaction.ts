import * as levelDb from '../../services/level';
import config from '../../services/config';
import { BlockObject, TransactionObject } from 'nuls-js';
import { AbstractIteratorOptions, PutBatch } from 'abstract-leveldown';
import { getLastKey } from './common';

export async function getTransaction(hash: string): Promise<BlockObject> {

  const db = await levelDb.connect(config.level.databases.hashTransaction);
  return await db.get(hash);

}

export async function putTransaction(tx: TransactionObject): Promise<void> {

  const db = await levelDb.connect(config.level.databases.hashTransaction);
  await db.put(tx.hash, tx);

}

export async function putBatchTransactions(txs: TransactionObject[]): Promise<void> {

  const batchList: PutBatch[] = txs.map((tx: TransactionObject) => ({ type: 'put' as 'put', key: tx.hash, value: tx }));

  const db = await levelDb.connect(config.level.databases.hashTransaction);
  await db.batch(batchList);

}

export async function getLastTransactionHeight(): Promise<number> {

  const key: string = await getLastKey(config.level.databases.hashTransaction);
  return parseInt(key);

}

export async function subscribeToTransaction(filters: AbstractIteratorOptions): Promise<NodeJS.ReadableStream> {

  const db = await levelDb.connect(config.level.databases.hashTransaction);
  return db.createReadStream(filters);

}