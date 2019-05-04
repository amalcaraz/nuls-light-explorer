import * as levelDb from '../db/level/blockByte';
import * as nulsService from '../services/nuls';
import { NulsBlockHeader } from '../models/nuls';
import { checkVersion } from './utils';

export async function fetchBlock(currentHeight: number, blockBytesFlag?: boolean): Promise<string> {

  if (!blockBytesFlag) {
    blockBytesFlag = await checkVersion();
  }

  let blockBytes: string;

  if (blockBytesFlag) {

    blockBytes = await nulsService.getBlockBytes(currentHeight);

  } else {

    const blockHeader: NulsBlockHeader = await nulsService.getBlockHeader(currentHeight);
    blockBytes = await nulsService.getBlockBytes(blockHeader.hash);

  }

  await levelDb.putBlockBytes(currentHeight, blockBytes);

  return blockBytes;

}
