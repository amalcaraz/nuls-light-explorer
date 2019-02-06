import * as levelDb from '../../services/level';
import config from '../../services/config';
import { UtxosDb } from '../../models/utxos';
import { address } from '../../models';
import { PutBatch } from 'abstract-leveldown';

export async function getUtxos(address: address): Promise<UtxosDb> {

  const db = await levelDb.connect(config.level.databases.addressUtxos);
  return await db.get(address);

}

export async function putUtxos(address: address, utxos: UtxosDb): Promise<void> {

  const db = await levelDb.connect(config.level.databases.addressUtxos);
  return await db.put(address, utxos);

}

export async function getLastUtxosHeight(): Promise<number> {

  const db = await levelDb.connect(config.level.databases.common);
  return await db.get('lastUtxosHeight');

}

export async function putLastUtxosHeight(height: number): Promise<void> {

  const db = await levelDb.connect(config.level.databases.common);
  await db.put('lastUtxosHeight', height);

}

export async function putBatchUtxos(utxos: Record<address, UtxosDb>): Promise<void> {

  const batchList: PutBatch[] = Object.keys(utxos).map((addr: address) => ({ type: 'put' as 'put', key: addr, value: utxos[addr] }));

  const db = await levelDb.connect(config.level.databases.addressUtxos)
  await db.batch(batchList);

}
