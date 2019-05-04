import { TransactionDb } from './../../models/transaction';
import logger from '../../services/logger';
import * as levelDb from '../../db/level';
import config from '../../services/config';
import { sleep } from './utils';
import { BlockDb, Block } from '../../models/block';
import { splitBlock, parseBlock } from '../../domain/block';
import { MessageType } from '.';

class BlockParseJob {

  static batchCount: number = 1000;

  private lastSafeHeight: number = -1;
  private blockBytesStream: NodeJS.ReadableStream;
  private lastBlockProcessed: Block | BlockDb | undefined;
  private currentHeight: number = 0;
  private topHeight: number = -1;

  async run() {

    while (true) {

      try {

        this.lastSafeHeight = await levelDb.getLastBlockHeight().catch(() => -1);
        this.currentHeight = this.lastSafeHeight + 1;
        this.lastBlockProcessed = await levelDb.getBlock(this.lastSafeHeight).catch(() => undefined);

        await this.startParsingBlocks();

      } catch (e) {

        logger.error(`Error parsing blocks: ${e}`);
        logger.info(`Retrying in ${config.jobs.blockTime} sec...`);
        await sleep(1000 * config.jobs.blockTime);

      }

    }

  }

  async startParsingBlocks() {

    while (true) {

      try {

        this.topHeight = await levelDb.getLastBlockBytesHeight().catch(() => -1);

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

        const blocks: Block[] = [];
        let currentHeight: number = fromBlock;
        let lastBlockProcessed: Block | BlockDb | undefined = this.lastBlockProcessed;

        const errorFn = async (e: Error) => {

          this.removeBlockBytesStream();
          await this.saveBatchBlocks(blocks);
          reject(e);

        };

        // logger.info(`Parsing blocks from [${fromBlock}] to [${toBlock}]`);

        this.blockBytesStream = (await levelDb.subscribeToBlockBytes({
          keys: true,
          values: true,
          gte: fromBlock,
          lt: toBlock
        }))
          .on('data', ({ key, value: blockBytes }) => {

            try {

              const k: number = parseInt(key);

              if (k > currentHeight) {
                throw (new Error('Non sequential block found'));
              }

              const currentBlock: Block = parseBlock(blockBytes);
              const currentBlockPreHash: string = currentBlock.preHash;
              const lastSafeBlockHash: string = lastBlockProcessed ? lastBlockProcessed.hash : currentBlock.preHash;

              // logger.debug(`block[${currentBlock.height}]::${currentBlockPreHash} <---> ${lastSafeBlockHash}::[${lastBlockProcessed ? lastBlockProcessed.height : 'undefined'}]lastBlock`);

              if (currentBlockPreHash !== lastSafeBlockHash) {

                this.startRollback(currentBlock.height);
                throw new Error('Non valid preHash found');

              }

              blocks.push(currentBlock);
              lastBlockProcessed = currentBlock;
              currentHeight++;

            } catch (e) {

              logger.error(`Error parsing block height [${currentHeight}]`);
              errorFn(e);

            }

          })
          .on('error', errorFn)
          .on('end', async () => {

            this.removeBlockBytesStream();
            await this.saveBatchBlocks(blocks);
            resolve();

          });
      }

    });

  }

  private removeBlockBytesStream() {

    if (this.blockBytesStream) {

      this.blockBytesStream.removeAllListeners();
      this.blockBytesStream = undefined as any;

    }

  }

  private async saveBatchBlocks(blocks: Block[]) {

    const bestHeight: number = blocks.length > 0 ? blocks[blocks.length - 1].height : this.lastSafeHeight;

    if (bestHeight > this.lastSafeHeight) {

      logger.info(`New parsed blocks best height: [${bestHeight}]`);

      const dbModels = this.splitBlocks(blocks);

      await levelDb.putBatchTransactions(dbModels.transactions);
      await levelDb.putBatchBlocks(dbModels.blocks);

      this.lastSafeHeight = bestHeight;
      this.currentHeight = bestHeight + 1;
      this.lastBlockProcessed = dbModels.blocks[blocks.length - 1];

    }

  }

  private splitBlocks(blockObjs: Block[]): { blocks: BlockDb[], transactions: TransactionDb[] } {

    const blocks: BlockDb[] = [];
    const transactions: TransactionDb[] = [];

    blockObjs.forEach((blockObj: Block) => {

      const { block: blk, transactions: txs } = splitBlock(blockObj);

      blocks.push(blk);
      transactions.push(...txs);

    });

    return {
      blocks,
      transactions
    };

  }

  private startRollback(currentHeight: number) {
    if (process.send) {
      process.send({ type: MessageType.START_ROLLBACK, body: currentHeight });
    }
  }

}

function run() {

  const job: BlockParseJob = new BlockParseJob();
  job.run();

}

export default run;

if (require.main === module) {

  (logger as any) = logger.child({
    pid: 'parse-blocks'
  });

  run();

}
