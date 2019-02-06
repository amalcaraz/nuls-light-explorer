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

export async function getBlockHeightByHash(hash: string): Promise<number> {

  const db = await levelDb.connect(config.level.databases.hashHeight);
  return await db.get(hash);

}

export async function putBlock(block: BlockDb): Promise<void> {

  const k = getBlockNumberKey(block.height);

  await Promise.all([
    levelDb.connect(config.level.databases.heightBlock).then((db) => db.put(k, block)),
    levelDb.connect(config.level.databases.hashHeight).then((db) => db.put(block.hash, block.height)),
  ]);

}

export async function putBatchBlocks(blocks: BlockDb[]): Promise<void> {

  const blocksBatchList: PutBatch[] = [];
  const hashesBatchList: PutBatch[] = [];

  blocks.forEach((block: BlockDb) => {
    const k = getBlockNumberKey(block.height);
    blocksBatchList.push({ type: 'put' as 'put', key: k, value: block });
    hashesBatchList.push({ type: 'put' as 'put', key: block.hash, value: block.height });
  });

  await Promise.all([
    levelDb.connect(config.level.databases.heightBlock).then((db) => db.batch(blocksBatchList)),
    levelDb.connect(config.level.databases.hashHeight).then((db) => db.batch(hashesBatchList)),
  ]);

}

export async function getLastBlockHeight(): Promise<number> {

  const key: string = await getLastKey(config.level.databases.heightBlock);
  return parseInt(key);

}

export async function subscribeToBlocks(filters: AbstractIteratorOptions): Promise<NodeJS.ReadableStream> {

  let options = { ...filters };

  for (let k of Object.keys(filters)) {
    if (k === 'gt' || k === 'gte' || k === 'lt' || k === 'lte') {
      options[k] = getBlockNumberKey(filters[k]);
    }
  }

  const db = await levelDb.connect(config.level.databases.heightBlock);
  return db.createReadStream(options);
}