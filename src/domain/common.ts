import { error } from '../utils/error';
import { nulsGetLastHeightError } from './error';
import * as levelDb from '../db/level';

export async function getLastHeight(): Promise<[number]> {

  try {

    // return [await nulsService.getLastHeight()];
    return [await levelDb.getLastBlockHeight().catch(() => -1)];

  } catch (e) {

    throw error(nulsGetLastHeightError, e);

  }

}
