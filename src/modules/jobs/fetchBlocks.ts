import logger from '../../services/logger';
import * as nulsService from '../../services/nuls';
import * as levelDb from '../../db/level/blockByte';
import config from '../../services/config';
import * as PromisePool from 'es6-promise-pool';
import { sleep } from './utils';
import { OrderedSet } from 'immutable';
import { fetchBlock } from '../../domain/blockBytes';
import { checkVersion } from '../../domain/utils';

class BlockFetchJob {

  // static roundsToCheckMissed = 1000;
  static timeToCheckMissed = 1000 * config.jobs.blockTime;
  static blocksToCheck = 10000;
  static parallelBlocks = 10;
  static fetchBlockByHeightVersion = 1

  private blockBytesFlag: boolean;
  private checkMissedBlocksInverval: undefined | NodeJS.Timeout;
  private missedBlocks: OrderedSet<number> = OrderedSet<number>();
  private lastSafeHeight: number = -1;
  private currentHeight: number = 0;
  private topHeight: number = -1;
  private checkingMissedStream: NodeJS.ReadableStream;

  async run() {

    while (true) {

      try {

        this.blockBytesFlag = await checkVersion();
        this.lastSafeHeight = await levelDb.getLastBlockBytesHeight().catch(() => -1);
        this.currentHeight = this.lastSafeHeight + 1;

        this.checkMissedBlocksInverval = setInterval(() => this.checkMissedBlocks(), 1000 * config.jobs.blockTime);

        await this.startFetchingBlocks();

      } catch (e) {

        if (this.checkMissedBlocksInverval) {
          clearInterval(this.checkMissedBlocksInverval);
        }

        logger.error(`Error fetching blocks: ${e}`);
        logger.info(`Retrying in ${config.jobs.blockTime} sec...`);
        await sleep(1000 * config.jobs.blockTime);

      }

    }

  }

  private async startFetchingBlocks() {

    while (true) {

      try {

        this.topHeight = await nulsService.getLastHeight();

        if (this.currentHeight <= this.topHeight || this.missedBlocks.size > 0) {

          // logger.debug(`Fetching blocks from [${this.currentHeight}] to [${this.topHeight}], and (${this.missedBlocks.size}) missed`);

          const promiseIterator: any = this.missedBlocksGenerator();
          const pool = new PromisePool(promiseIterator, BlockFetchJob.parallelBlocks);
          await pool.start();

        }

        logger.debug(`Waiting ${config.jobs.blockTime} secs until next check`);
        await sleep(1000 * config.jobs.blockTime + 1);

      } catch (e) {

        logger.error(`Error fetching blocks: ${e}`);
        logger.info(`Retrying in ${config.jobs.blockTime} sec...`);
        await sleep(1000 * config.jobs.blockTime);

      }

    }

  }

  private async fetchBlock(currentHeight: number): Promise<number> {

    try {

      await fetchBlock(currentHeight, this.blockBytesFlag);

    } catch (e) {

      logger.debug(`--> Error fetching block [${currentHeight}], add to pending...`);
      this.missedBlocks = this.missedBlocks.add(currentHeight);

    }

    return currentHeight;

  }

  private async checkMissedBlocks() {

    if (!this.checkingMissedStream) {

      let bestHeight: number = -1;
      let currentKey: number = this.lastSafeHeight + 1;

      // logger.debug(`Checking blocks from height [${currentKey}]`);

      const endFn = async () => {

        this.removeCheckMissedStream();
        await this.saveSafestHeight(bestHeight);

      };

      this.checkingMissedStream = (await levelDb.subscribeToBlockBytes({
        keys: true,
        values: false,
        gte: currentKey,
        lt: this.lastSafeHeight + BlockFetchJob.blocksToCheck
      }))
        .on('data', (key: string) => {

          // if (currentKey % 10000 === 0)
          //   logger.debug('Checking key --> ', currentKey);

          const k: number = parseInt(key);

          if (k > currentKey) {

            bestHeight = currentKey - 1;
            endFn();

          } else {

            bestHeight = currentKey;
            currentKey++;

          }

        })
        .on('error', (e: any) => {

          this.removeCheckMissedStream();
          throw new Error('Error processing last safe height');

        })
        .on('end', endFn);

    }

  }

  private removeCheckMissedStream() {

    if (this.checkingMissedStream) {

      this.checkingMissedStream.removeAllListeners();
      this.checkingMissedStream = undefined as any;

    }

  }

  private async saveSafestHeight(bestHeight: number) {

    if (bestHeight > this.lastSafeHeight) {

      logger.info(`New block bytes safe height: [${bestHeight}]`);
      await levelDb.putLastBlockBytesHeight(bestHeight);
      this.lastSafeHeight = bestHeight;

    }

  }

  private * missedBlocksGenerator(): IterableIterator<Promise<any>> {

    while (this.currentHeight <= this.topHeight) {

      let pendingBlock: number | undefined;

      while ((pendingBlock = this.missedBlocks.min()) !== undefined) {

        this.missedBlocks = this.missedBlocks.delete(pendingBlock);
        yield this.fetchBlock(pendingBlock);

      }

      yield this.fetchBlock(this.currentHeight);
      this.currentHeight++;

    }

  }
}

async function run() {
  
  const job: BlockFetchJob = new BlockFetchJob();
  job.run();

}

export default run;

if (require.main === module) {
  
  (logger as any) = logger.child({
    pid: 'fetch-blocks'
  });

  run();

}
