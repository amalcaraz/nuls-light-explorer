import * as levelDb from '../../services/level';
import config from '../../services/config';
import { Block } from 'nuls-js';

export async function getBlock(height: number): Promise<Block> {
  
  const db = levelDb.connect(config.level.databases.heightBlock);
  return await db.get(height);

}

export async function putBlock(block: Block): Promise<void> {
  
  const db = levelDb.connect(config.level.databases.heightBlock);
  await db.put((block as any)._header._height, block);

}

export async function getLastHeight(): Promise<number> {
  
  const db = levelDb.connect(config.level.databases.common);
  return db.get('lastHeight');

}

export async function putLastHeight(height: number): Promise<void> {
  
  const db = levelDb.connect(config.level.databases.common);
  await db.put('lastHeight', height);

}


export async function getBlockBytes(height: number): Promise<string> {
  
  const db = levelDb.connect(config.level.databases.heightBlockBytes);
  return await db.get(height);

}

export async function putBlockBytes(height: number, blockBytes: string): Promise<void> {
  
  const db = levelDb.connect(config.level.databases.heightBlockBytes);
  await db.put(height, blockBytes);

}

export async function getLastHeightBlockBytes(): Promise<number> {
  
  const db = levelDb.connect(config.level.databases.common);
  return db.get('lastHeightBlockBytes');

}

export async function putLastHeightBlockBytes(height: number): Promise<void> {
  
  const db = levelDb.connect(config.level.databases.common);
  await db.put('lastHeightBlockBytes', height);

}