import * as levelDb from '../../services/level';
import config from '../../services/config';
import { AbstractIteratorOptions, DelBatch } from 'abstract-leveldown';
import { getBlockNumberKey } from './common';

export async function getBlockBytes(height: number): Promise<string> {

  const k = getBlockNumberKey(height);

  const db = await levelDb.connect(config.level.databases.heightBlockBytes);
  return await db.get(k);

}

export async function putBlockBytes(height: number, blockBytes: string): Promise<void> {

  const k = getBlockNumberKey(height);

  const db = await levelDb.connect(config.level.databases.heightBlockBytes);
  await db.put(k, blockBytes);

}

export async function deleteBlockBytes(height: number): Promise<void> {

  const k = getBlockNumberKey(height);

  const db = await levelDb.connect(config.level.databases.heightBlockBytes);
  await db.del(k);

}

export async function deleteBatchBlockBytes(heights: number[]): Promise<void> {

  const blocksBytesBatchList: DelBatch[] = heights
    .map((height: number) => ({ type: 'del' as 'del', key: getBlockNumberKey(height) }));

  const db = await levelDb.connect(config.level.databases.heightBlockBytes);
  await db.batch(blocksBytesBatchList);

}

export async function getLastBlockBytesHeight(): Promise<number> {

  const db = await levelDb.connect(config.level.databases.common);
  return await db.get('lastHeightBlockBytes');

}

export async function putLastBlockBytesHeight(height: number): Promise<void> {

  const db = await levelDb.connect(config.level.databases.common);
  await db.put('lastHeightBlockBytes', height);

}

export async function subscribeToBlockBytes(filters: AbstractIteratorOptions): Promise<NodeJS.ReadableStream> {

  let options = { ...filters };

  for (let k of Object.keys(filters)) {
    if (k === 'gt' || k === 'gte' || k === 'lt' || k === 'lte') {
      options[k] = getBlockNumberKey(filters[k]);
    }
  }

  const db = await levelDb.connect(config.level.databases.heightBlockBytes);
  return db.createReadStream(options);
}
