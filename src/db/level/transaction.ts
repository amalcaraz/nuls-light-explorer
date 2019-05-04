import * as levelDb from '../../services/level';
import config from '../../services/config';
import { AbstractIteratorOptions, PutBatch, DelBatch } from 'abstract-leveldown';
import { getLastKey } from './common';
import { TransactionDb } from '../../models';

export async function getTransaction(hash: string): Promise<TransactionDb> {

  const db = await levelDb.connect(config.level.databases.hashTransaction);
  return await db.get(hash);

}

export async function putTransaction(tx: TransactionDb): Promise<void> {

  const db = await levelDb.connect(config.level.databases.hashTransaction);
  await db.put(tx.hash, tx);

}

export async function putBatchTransactions(txs: TransactionDb[]): Promise<void> {

  const batchList: PutBatch[] = txs.map((tx: TransactionDb) => ({ type: 'put' as 'put', key: tx.hash, value: tx }));

  const db = await levelDb.connect(config.level.databases.hashTransaction);
  await db.batch(batchList);

}

export async function deleteTransaction(hash: string): Promise<void> {

  const db = await levelDb.connect(config.level.databases.hashTransaction);
  await db.del(hash);

}

export async function deleteBatchTransactions(txHashes: string[]): Promise<void> {

  const batchList: DelBatch[] = txHashes.map((hash: string) => ({ type: 'del' as 'del', key: hash }));

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