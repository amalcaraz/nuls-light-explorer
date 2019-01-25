import logger from '../../services/logger';
import * as nulsService from '../../services/nuls';
import { NulsBlockHeader } from '../../models/nuls';
import * as levelDb from '../../db/level/explorer';
import config from '../../services/config';
import * as PromisePool from 'es6-promise-pool';
import * as level from '../../services/level';

const batch: number = 100;

function* newBlocksGenerator(currentHeight: number, netTopHeight: number): IterableIterator<Promise<any>> {

  while (currentHeight <= netTopHeight) {

    yield fetchBlock(currentHeight);
    currentHeight++;

  }

}

async function fetchMissedBlocks(lastBlockHeight: number): Promise<number[]> {

  const db = level.connect(config.level.databases.heightBlockBytes);
  let currentKey: number = lastBlockHeight + 1;

  const missed: number[] = [];

  return new Promise((resolve, reject) => {

    db
      .createKeyStream({ gt: lastBlockHeight })
      .on('data', (key: string) => {

        const k: number = parseInt(key);

        if (k > currentKey) {

          levelDb.putLastHeightBlockBytes(currentKey);

          while (k > currentKey) {
            missed.push(currentKey);
            currentKey++;
          }

        }

      })
      .on('error', (e) => {

        reject(e);

      })
      .on('end', () => {

        resolve(missed);

      });

  });

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

async function fetchBlocks(currentHeight: number): Promise<any> {

  const promiseIterator: any = newBlocksGenerator(lastBlockHeight + 1, netTopHeight);
  const pool = new PromisePool(promiseIterator, 1000);

  await pool.start();

}

async function run() {

  while (true) {

    try {

      let lastBlockHeight = (await levelDb.getLastHeightBlockBytes().catch(() => -1)) || -1;

      const missedBlocks = await fetchMissedBlocks(lastBlockHeight);

      const netTopHeight: number = await nulsService.getLastHeight();

      if (lastBlockHeight < netTopHeight) {
        // Fetch blocks in parallel in batches of 10 requests

       

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
