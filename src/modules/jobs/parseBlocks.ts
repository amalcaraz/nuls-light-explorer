import { TransactionDb, Transaction } from './../../models/transaction';
import logger from '../../services/logger';
import { Block, BlockObject } from 'nuls-js';
import * as levelDb from '../../db/level';
import config from '../../services/config';
import { sleep } from './utils';
import { BlockDb } from '../../models/block';

class BlockParseJob {

  static batchCount: number = 5000;

  private lastSafeHeight: number = -1;
  private blockBytesStream: NodeJS.ReadableStream;
  private lastBlockProcessed: BlockObject | BlockDb | undefined;
  private currentHeight: number = 0;
  private topHeight: number = -1;

  async run() {

    this.lastSafeHeight = await levelDb.getLastBlockHeight().catch(() => -1);
    this.currentHeight = this.lastSafeHeight + 1;
    this.lastBlockProcessed = await levelDb.getBlock(this.lastSafeHeight).catch(() => undefined);

    while (true) {

      try {

        this.topHeight = await levelDb.getLastHeightBlockBytes().catch(() => -1);

        while (this.currentHeight <= this.topHeight) {

          await this.parseBlocks(this.currentHeight, Math.min(this.topHeight + 1, this.currentHeight + BlockParseJob.batchCount));

        }

        logger.debug(`Waiting ${config.jobs.blockTime} secs until next check`);
        await sleep(1000 * config.jobs.blockTime + 1);

      } catch (e) {

        logger.error(`Error parsing blocks: ${e}`);
        logger.info(`Retrying in ${config.jobs.blockTime} sec...`);
        await sleep(1000 * config.jobs.blockTime);

      }

    }

  }

  async parseBlocks(fromBlock: number, toBlock: number) {

    return new Promise(async (resolve, reject) => {

      if (this.blockBytesStream) {

        reject(new Error('Parsing process already in course'));

      } else {

        const blocks: BlockObject[] = [];
        let currentHeight: number = fromBlock;
        let lastBlockProcessed: BlockObject | BlockDb | undefined = this.lastBlockProcessed;

        const errorFn = async (e: Error) => {

          this.removeCheckMissedStream();
          await this.saveBatchBlocks(blocks);
          reject(e);

        };

        logger.info(`Parsing blocks from [${fromBlock}] to [${toBlock}]`);

        this.blockBytesStream = (await levelDb.subscribeToBlockBytes({
          keys: true,
          values: true,
          gte: fromBlock,
          lt: toBlock
        }))
          .on('data', async ({ key, value: blockBytes }) => {

            try {

              const k: number = parseInt(key);

              if (k > currentHeight) {
                throw (new Error('Non sequential block found'));
              }

              const currentBlock: BlockObject = this.parseBlock(blockBytes);
              const currentBlockPreHash: string = currentBlock.preHash;
              const lastSafeBlockHash: string = lastBlockProcessed ? lastBlockProcessed.hash : currentBlock.preHash;

              // logger.debug(`block[${currentBlock.height}]::${currentBlockPreHash} <---> ${lastSafeBlockHash}::[${lastBlockProcessed ? lastBlockProcessed.height : 'undefined'}]lastBlock`);

              if (currentBlockPreHash !== lastSafeBlockHash) {
                throw (new Error('Non valid preHash found'));
              }

              blocks.push(currentBlock);
              lastBlockProcessed = currentBlock;
              currentHeight++;

            } catch (e) {

              errorFn(e);

            }

          })
          .on('error', errorFn)
          .on('end', async () => {

            this.removeCheckMissedStream();
            await this.saveBatchBlocks(blocks);
            resolve();

          });
      }

    });

  }

  private removeCheckMissedStream() {

    if (this.blockBytesStream) {

      this.blockBytesStream.removeAllListeners();
      this.blockBytesStream = undefined as any;

    }

  }

  private async saveBatchBlocks(blocks: BlockObject[]) {

    const bestHeight: number = blocks.length > 0 ? blocks[blocks.length - 1].height : this.lastSafeHeight;

    if (bestHeight > this.lastSafeHeight) {

      logger.info(`New parsed blocks best height: [${bestHeight}]`);

      const dbModels = this.getDbBlocksAndTransactions(blocks);
      await Promise.all([
        levelDb.putBatchBlocks(dbModels.blocks),
        levelDb.putBatchTransactions(dbModels.transactions)
      ]);

      this.lastSafeHeight = bestHeight;
      this.currentHeight = bestHeight + 1;
      this.lastBlockProcessed = dbModels.blocks[blocks.length - 1];

    }

  }

  private getDbBlocksAndTransactions(blocks: BlockObject[]): { blocks: BlockDb[], transactions: TransactionDb[] } {

    const transactions: TransactionDb[] = [];

    blocks.forEach((block: BlockObject) => {

      const transactionHashes = block.transactions.map((tx: Transaction) => tx.hash);
      transactions.push(...block.transactions);
      delete (block as BlockDb).transactions;
      (block as BlockDb).transactionHashes = transactionHashes;

    });

    return {
      blocks: blocks as BlockDb[],
      transactions
    };

  }

  parseBlock(blockBytes: string): BlockObject {

    const blockBytesBuffer: Buffer = Buffer.from(blockBytes, 'base64');
    const block: BlockObject = Block.fromBytes(blockBytesBuffer).toObject();

    // wait for batch insert
    // await levelDb.putBlock(block);

    return block;

  }

}

async function run() {

  const job: BlockParseJob = new BlockParseJob();
  await job.run();

}

export default run;

if (require.main === module) {
  run();
}
