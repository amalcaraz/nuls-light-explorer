import logger from '../../services/logger';
import * as nulsService from '../../services/nuls';
import { NulsBlockHeader } from '../../models/nuls';
import { Block } from 'nuls-js';
import * as levelDb from '../../db/level/explorer';

const batch: number = 100;

async function processNewBlock(currentHeight: number) {

  const blockHeader: NulsBlockHeader = await nulsService.getBlockHeader(currentHeight);
  const blockBytes: string = await nulsService.getBlockBytes(blockHeader.hash);

  logger.debug(`--> Processing block [${currentHeight}]`);

  const blockBytesBuffer: Buffer = Buffer.from(blockBytes, 'base64'); 
  const block: Block = Block.fromBytes(blockBytesBuffer);

  // not need to await the insert cause next block will not modify this one
  levelDb.putBlock(block);

}

async function run() {

  let lastBlockHeighProcessed = (await levelDb.getLastHeight().catch(() => -1)) || -1;

  while (true) {

    try {

      const netTopHeight: number = await nulsService.getLastHeight();

      if (lastBlockHeighProcessed < netTopHeight) {

        for (let currentHeight = lastBlockHeighProcessed + 1; currentHeight <= netTopHeight; currentHeight++) {

          await processNewBlock(currentHeight);
          lastBlockHeighProcessed = currentHeight;
  
          if (currentHeight % batch === 0) {
            await levelDb.putLastHeight(currentHeight); 
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
