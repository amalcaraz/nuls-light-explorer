import logger from '../../services/logger';
import { Block, BlockObject } from 'nuls-js';
import * as levelDb from '../../db/level';
import config from '../../services/config';
import { sleep } from './utils';

class BlockParseJob {

  static batchCount: number = 1000;

  private lastSafeHeight: number = -1;
  private blockBytesStream: NodeJS.ReadableStream;
  private lastBlockProcessed: BlockObject | undefined;

  async run() {

    this.lastSafeHeight = await levelDb.getLastBlockHeight().catch(() => -1);
    this.lastBlockProcessed = await levelDb.getBlock(this.lastSafeHeight).catch(() => undefined);

    while (true) {

      try {

        await this.parseBlocks();

      } catch (e) {

        logger.error(`Error parsing blocks: ${e}`);
        logger.info(`Retrying in ${config.jobs.blockTime} sec...`);
        await sleep(1000 * config.jobs.blockTime);

      }

    }

  }

  async parseBlocks() {

    return new Promise(async (resolve, reject) => {

      if (this.blockBytesStream) {

        reject(new Error('Parsing process already in course'));

      } else {

        const blocks: BlockObject[] = [];
        let currentHeight: number = this.lastSafeHeight + 1;
        let lastBlockProcessed: BlockObject | undefined = this.lastBlockProcessed;

        const errorFn = (e: Error) => {

          this.saveBatchBlocks(blocks);
          this.removeCheckMissedStream();
          reject(e);

        };

        logger.info(`Parsing blocks from [${currentHeight}] to [${currentHeight + BlockParseJob.batchCount}]`);

        this.blockBytesStream = (await levelDb.subscribeToBlockBytes({
          keys: true,
          values: true,
          gte: currentHeight,
          lt: currentHeight + BlockParseJob.batchCount
        }))
          .on('data', async ({ key, blockBytes }) => {

            try {

              const k: number = parseInt(key);

              if (k > currentHeight) {
                throw (new Error('Non sequential block found'));
              }

              const currentBlock: BlockObject = this.parseBlock(blockBytes);
              const currentBlockPreHash: string = currentBlock.blockHeader.preHash;
              const lastSafeBlockHash: string = lastBlockProcessed ? lastBlockProcessed.blockHeader.hash : currentBlock.blockHeader.preHash;

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

            this.saveBatchBlocks(blocks);
            this.removeCheckMissedStream();
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

  private async saveBatchBlocks(blocks: BlockObject[] = []) {

    const bestHeight: number = blocks.length > 0 ? blocks[blocks.length - 1].blockHeader.height : this.lastSafeHeight;

    if (bestHeight > this.lastSafeHeight) {

      logger.info(`New parsed blocks best height: [${bestHeight}]`);
      await levelDb.putBatchBlocks(blocks);
      this.lastSafeHeight = bestHeight;

    }

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
