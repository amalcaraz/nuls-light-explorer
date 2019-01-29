import * as levelDb from '../../services/level';
import config from '../../services/config';
import { BlockObject } from 'nuls-js';
import { getBlockNumberKey } from '../../modules/jobs/utils';
import { AbstractIteratorOptions, PutBatch } from 'abstract-leveldown';

export async function getBlock(height: number): Promise<BlockObject> {

  const k = getBlockNumberKey(height);

  const db = await levelDb.connect(config.level.databases.heightBlock);
  return await db.get(k);

}

export async function putBlock(block: BlockObject): Promise<void> {

  const k = getBlockNumberKey(block.blockHeader.height);

  const db = await levelDb.connect(config.level.databases.heightBlock);
  await db.put(k, block);

}

export async function putBatchBlocks(blocks: BlockObject[]): Promise<void> {

  const batchList: PutBatch[] = blocks.map((b: BlockObject) => ({ type: 'put' as 'put', key: getBlockNumberKey(b.blockHeader.height), value: b }));

  const db = await levelDb.connect(config.level.databases.heightBlock);
  await db.batch(batchList);

}

// export async function getLastHeight(): Promise<number> {

//   const db = await levelDb.connect(config.level.databases.common);
//   return await db.get('lastHeight');

// }

// export async function putLastHeight(height: number): Promise<void> {

//   const db = await levelDb.connect(config.level.databases.common);
//   await db.put('lastHeight', height);

// }

export async function getLastHeight(): Promise<number> {

  const db = await levelDb.connect(config.level.databases.heightBlock);
  const iterator = (db as any).iterator({ keys: true, values: false, reverse: true, limit: 1 });

  return new Promise<number>((resolve, reject) => {

    iterator.next((e: Error, key: string) => {

      let error: Error = e;

      iterator.end((e: Error) => {

        error = e || error;

        !error && key !== undefined
          ? resolve(parseInt(key))
          : reject(error);

      });

    });

  });

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