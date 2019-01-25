import { Collection, Db, InsertOneWriteOpResult } from 'mongodb';
import config from '../services/config';
import * as db from '../services/db';
import { ConsensusModel } from '../models/consensus';
import { blockHeight } from '../models/common';
import { Block } from '../models/block';
import { BaseTransaction } from '../models/transaction';

const database: string = config.db.database;
const blocksCollection: string = config.db.collections.blocks;
const transactionsCollection: string = config.db.collections.transactions;
const consensusCollection: string = config.db.collections.consensus;


async function _getCollection(collection: string): Promise<Collection> {
  return await db.getDb(database).then((client: Db) => client.collection(collection));
}

export async function getLastBlockHeight(): Promise<blockHeight> {

  const coll: Collection = await _getCollection(blocksCollection);

  return coll
    .find({})
    .sort({ height: -1 })
    .limit(1)
    .next()
    .then((block: Block) => block.height)
    .catch(() => 0);

}

export async function putBlock(block: any): Promise<InsertOneWriteOpResult> {

  const coll: Collection = await _getCollection(blocksCollection);

  return coll.insert(block);

}

export async function getConsensus(height?: blockHeight): Promise<ConsensusModel> {

  const coll: Collection = await _getCollection(consensusCollection);
  const filters: any = height ? { height } : {}

  return coll
    .find(filters)
    .sort({ height: -1 })
    .limit(1)
    .next();

}

export async function getConsensusList(filters?: Object): Promise<ConsensusModel[]> {

  const coll: Collection = await _getCollection(consensusCollection);

  return coll
    .find(filters)
    .sort({ height: -1 })
    .toArray();

}

export async function getBlocks(filters?: Object): Promise<Block[]> {

  const coll: Collection = await _getCollection(blocksCollection);

  return coll
    .find(filters)
    .sort({ height: -1 })
    .toArray();

}

export async function getTransactions(filters?: Object): Promise<BaseTransaction[]> {

  const coll: Collection = await _getCollection(transactionsCollection);

  return coll
    .find(filters)
    .sort({ blockHeight: -1 })
    .toArray();

}
