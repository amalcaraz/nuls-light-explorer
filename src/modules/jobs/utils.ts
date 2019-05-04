import logger from '../../services/logger';
import * as levelDb from '../../db/level';

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function checkConsecutiveKeys() {

  const lastSafeHeight = await levelDb.getLastBlockBytesHeight().catch(() => -1);

  let last = 0;
  let missed: boolean = false;

  return new Promise(async (resolve) => {

    (await levelDb
      .subscribeToBlockBytes({ lte: lastSafeHeight, keys: true, values: false }))
      .on('data', async (key: string) => {

        const k: number = parseInt(key);

        if (k % 10000 === 0) {
          logger.debug('keys --> ', k);
        }

        if (k > last + 1) {
          missed = true;
          logger.error(`missed key: ${k}, ${last + 1}`);
          await sleep(1000 * 5);
          throw new Error(`missed key: ${k}, ${last + 1}`);
        }

        last = k;

      }).on('error', async (e) => {
        logger.error(e);
        await sleep(1000 * 5);
      })
      .on('end', (key: string) => {

        console.log('STORED SAFE HEIGHT: ', lastSafeHeight);
        console.log('MISSED KEYS: ', missed);
        console.log('LAST KEY: ', last);

        resolve();
      });

  });

}

export async function checkConsecutiveBlockHashes(fromBlock: number, toBlock: number) {

  let lastBlockProcessed: any = await levelDb.getBlock(fromBlock - 1).catch(() => undefined);

  return new Promise<string | undefined>(async (resolve, reject) => {

    const stream = (await levelDb.subscribeToBlocks({
      gte: fromBlock,
      lt: toBlock,
      keys: true,
      values: true
    }))
      .on('data', ({ key, value: currentBlock }) => {

        const k: number = parseInt(key);

        if (k % 10000 === 0) {
          logger.debug('keys --> ', k);
        }

        const currentBlockPreHash: string = currentBlock.preHash;
        const lastSafeBlockHash: string = lastBlockProcessed ? lastBlockProcessed.hash : currentBlock.preHash;

        if (currentBlockPreHash !== lastSafeBlockHash) {

          stream.removeAllListeners();
          resolve(key);

        }

        lastBlockProcessed = currentBlock;

      }).on('error', (e) => {
        logger.error(e);
        stream.removeAllListeners();
        reject(e);
      })
      .on('end', () => {
        stream.removeAllListeners();
        resolve();
      });

  });

}