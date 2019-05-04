import { BlockDb, Block, TransactionDb, Transaction } from '../models';
import { error } from '../utils/error';
import { nulsGetBlockByHeightError, nulsGetBlockByHashError } from './error';
import * as levelDb from '../db/level';
import { Block as NulsBlock } from 'nuls-js';

export async function getBlockByHeight(height: number): Promise<BlockDb> {

  try {

    return await levelDb.getBlock(height);

  } catch (e) {

    throw error(nulsGetBlockByHeightError, e);

  }

}

export async function getBlockByHash(hash: string): Promise<BlockDb> {

  try {

    const height: number = await levelDb.getBlockHeightByHash(hash);
    return await levelDb.getBlock(height);

  } catch (e) {

    throw error(nulsGetBlockByHashError, e);

  }

}

export async function getFullBlockByHeight(height: number): Promise<Block> {

  try {

    const blockDb: BlockDb = await getBlockByHeight(height);
    const block: Block = await getFullBlock(blockDb);

    return block;

  } catch (e) {

    throw error(nulsGetBlockByHashError, e);

  }

}

export async function getFullBlockByHash(hash: string): Promise<Block> {

  try {

    const blockDb: BlockDb = await getBlockByHash(hash);
    const block: Block = await getFullBlock(blockDb);

    return block;

  } catch (e) {

    throw error(nulsGetBlockByHashError, e);

  }

}

export async function getFullBlock(block: BlockDb): Promise<Block> {

  const transactions: TransactionDb[] = []

  for (const txHash of block.transactionHashes) {
    const tx: TransactionDb = await levelDb.getTransaction(txHash);
    transactions.push(tx);
  }

  return joinBlock(block, transactions);

}

export function joinBlock(block: BlockDb, transactions: TransactionDb[]): Block {

  delete block.transactionHashes;
  (block as Block).transactions = transactions;

  return block;

}

export function splitBlock(block: Block): { block: BlockDb, transactions: TransactionDb[] } {

  const transactions: TransactionDb[] = block.transactions;
  const transactionHashes: string[] = block.transactions.map((tx: Transaction) => tx.hash);

  delete block.transactions;
  (block as BlockDb).transactionHashes = transactionHashes;

  return {
    block: block as BlockDb,
    transactions
  };

}

export function parseBlock(blockBytes: string): Block {

  const blockBytesBuffer: Buffer = Buffer.from(blockBytes, 'base64');
  const block: Block = NulsBlock.fromBytes(blockBytesBuffer).toObject();

  return block;

}