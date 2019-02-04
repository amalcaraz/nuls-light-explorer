import * as levelDb from '../../services/level';
import config from '../../services/config';
import { getBlockNumberKey } from '../../modules/jobs/utils';
import { AbstractIteratorOptions, PutBatch } from 'abstract-leveldown';
import { getLastKey } from './common';
import { BlockDb } from '../../models/block';

export async function getBlock(height: number): Promise<BlockDb> {

  const k = getBlockNumberKey(height);

  const db = await levelDb.connect(config.level.databases.heightBlock);
  return await db.get(k);

}

export async function putBlock(block: BlockDb): Promise<void> {

  const k = getBlockNumberKey(block.height);

  const db = await levelDb.connect(config.level.databases.heightBlock);
  await db.put(k, block);

}

export async function putBatchBlocks(blocks: BlockDb[]): Promise<void> {

  const batchList: PutBatch[] = blocks.map((b: BlockDb) => ({ type: 'put' as 'put', key: getBlockNumberKey(b.height), value: b }));

  const db = await levelDb.connect(config.level.databases.heightBlock);
  await db.batch(batchList);

}

export async function getLastBlockHeight(): Promise<number> {

  const key: string = await getLastKey(config.level.databases.heightBlock);
  return parseInt(key);

}

export async function subscribeToBlock(filters: AbstractIteratorOptions): Promise<NodeJS.ReadableStream> {

  let options = { ...filters };

  for (let k of Object.keys(filters)) {
    if (k === 'gt' || k === 'gte' || k === 'lt' || k === 'lte') {
      options[k] = getBlockNumberKey(filters[k]);
    }
  }

  const db = await levelDb.connect(config.level.databases.heightBlock);
  return db.createReadStream(options);
}