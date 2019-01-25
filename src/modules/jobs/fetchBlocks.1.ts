import logger from '../../services/logger';
import * as nulsService from '../../services/nuls';
import { NulsBlockHeader } from '../../models/nuls';
import * as levelDb from '../../db/level/explorer';
import config from '../../services/config';
import * as PromisePool from 'es6-promise-pool';

const batch: number = 100;

function* promiseGenerator(currentHeight: number, netTopHeight: number): IterableIterator<Promise<any>> {

  // Fetch blocks in parallel in batches of 10 requests
  while (currentHeight <= netTopHeight) {

    yield fetchBlock(currentHeight);
    currentHeight++;

  }

}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchBlock(currentHeight: number): Promise<any> {

  logger.debug(`--> Fetching block [${currentHeight}]`);

  const blockHeader: NulsBlockHeader = await nulsService.getBlockHeader(currentHeight);
  const blockBytes: string = await nulsService.getBlockBytes(blockHeader.hash);

  await levelDb.putBlockBytes(currentHeight, blockBytes);

}

async function run() {

  let lastBlockHeight = (await levelDb.getLastHeightBlockBytes().catch(() => -1)) || -1;

  while (true) {

    try {

      const netTopHeight: number = await nulsService.getLastHeight();

      if (lastBlockHeight < netTopHeight) {

        const promiseIterator: any = promiseGenerator(lastBlockHeight + 1, netTopHeight);
        const pool = new PromisePool(promiseIterator, 1000);

        pool.addEventListener('fulfilled', () => {

          lastBlockHeight++;

          if (lastBlockHeight % batch === 0) {
            // Dont await wasting time 
            levelDb.putLastHeightBlockBytes(lastBlockHeight);
          }

        })

        pool.addEventListener('rejected', (event: any)  => event.data.error);

        await pool.start();

      } else {

        logger.info(`Retrying in ${config.jobs.retryTimeout} sec...`);
        await sleep(1000 * config.jobs.retryTimeout);

      }

    } catch (e) {

      logger.error(`Error parsing block [${lastBlockHeight + 1}]: ${e}`);
      logger.info(`Retrying in ${config.jobs.retryTimeout} sec...`);
      await sleep(1000 * config.jobs.retryTimeout);

    }

  }

}

export default run;
