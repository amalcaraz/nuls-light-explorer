import logger from '../../services/logger';
import { Block, BlockObject } from 'nuls-js';
import * as levelDb from '../../db/level';
import config from '../../services/config';
import { sleep } from './utils';

class CalculateUtxosJob {

  static batchCount: number = 1000;

  private lastSafeHeight: number = -1;
  private blockBytesStream: NodeJS.ReadableStream;

  async run() {

    this.lastSafeHeight = await levelDb.getLastBlockHeight().catch(() => -1);

    while (true) {

      try {

        await this.processBlocks();

      } catch (e) {

        logger.error(`Error parsing blocks: ${e}`);
        logger.info(`Retrying in ${config.jobs.blockTime} sec...`);
        await sleep(1000 * config.jobs.blockTime);

      }

    }

  }

  async processBlocks() {

    return new Promise(async (resolve, reject) => {

      if (this.blockBytesStream) {

        reject(new Error('Utxos process already in course'));

      } else {

        const blocks: BlockObject[] = [];
        let currentHeight: number = this.lastSafeHeight + 1;

        const errorFn = (e: Error) => {

          this.saveBatchBlocks(blocks);
          this.removeCheckMissedStream();
          reject(e);

        };

        logger.info(`Calculating utxos from [${currentHeight}] to [${currentHeight + CalculateUtxosJob.batchCount}]`);

        this.blockBytesStream = (await levelDb.subscribeToBlock({
          keys: true,
          values: true,
          gte: currentHeight,
          lt: currentHeight + CalculateUtxosJob.batchCount
        }))
          .on('data', async ({ key, blockBytes }) => {

            try {

              const k: number = parseInt(key);

              if (k > currentHeight) {
                throw (new Error('Non sequential block found'));
              }

              const b: BlockObject = this.parseBlock(blockBytes);
              blocks.push(b);
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

    const bestHeight: number = blocks.length > 0 ? blocks[blocks.length - 1].height : this.lastSafeHeight;

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

  const job: CalculateUtxosJob = new CalculateUtxosJob();
  await job.run();

}

export default run;

if (require.main === module) {
  run();
}
