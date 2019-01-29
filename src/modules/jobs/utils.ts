import logger from '../../services/logger';
import * as levelDb from '../../db/level/blockBytes';

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const NUMERIC_INDEX_DIGIT: number = 8;

export function getBlockNumberKey(height: number): string {

  let ret: string = height.toString();

  while (ret.length < NUMERIC_INDEX_DIGIT) { ret = `0${ret}` }
  return ret;

}

export async function checkConsecutiveKeys() {

  const lastSafeHeight = await levelDb.getLastHeightBlockBytes().catch(() => -1);

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