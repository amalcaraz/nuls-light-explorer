import logger from '../../services/logger';
import * as nulsService from '../../services/nuls';
import { NulsBlockHeader } from '../../models/nuls';
import * as levelDb from '../../db/level/blockBytes';

const batch: number = 100;

async function processNewBlock(currentHeight: number) {

  const blockHeader: NulsBlockHeader = await nulsService.getBlockHeader(currentHeight);
  const blockBytes: string = await nulsService.getBlockBytes(blockHeader.hash);

  logger.debug(`--> Processing block [${currentHeight}]`);

  // not need to await the insert cause next block will not modify this one
  await levelDb.putBlockBytes(currentHeight, blockBytes);

}

async function run() {

  let lastBlockHeighProcessed = (await levelDb.getLastHeightBlockBytes().catch(() => -1)) || -1;

  while (true) {

    try {

      const netTopHeight: number = await nulsService.getLastHeight();

      if (lastBlockHeighProcessed < netTopHeight) {

        for (let currentHeight = lastBlockHeighProcessed + 1; currentHeight <= netTopHeight; currentHeight++) {

          await processNewBlock(currentHeight);
          lastBlockHeighProcessed = currentHeight;
  
          if (currentHeight % batch === 0) {
            await levelDb.putLastHeightBlockBytes(currentHeight); 
          }

        }
       
      } else {

        logger.info(`Retrying in 8 sec...`);
        setTimeout(run, 1000 * 8);
        break;

      }

    } catch (e) {

      logger.error(`Error parsing block [${lastBlockHeighProcessed + 1}]: ${e}`);
      logger.info(`Retrying in 8 sec...`);
      setTimeout(run, 1000 * 8);
      break;

    }

  }

}

export default run;
