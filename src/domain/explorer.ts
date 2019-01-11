import * as nulsService from '../services/nuls';
import { error } from '../utils/error';
import { nulsBroadcastTransactionError } from './error';

export interface IExplorerResponse {
  success: boolean;
}

export async function broadcastTransaction(txHex: string): Promise<IExplorerResponse> {

  try {

    return await nulsService.broadcastTransaction(txHex);

  } catch (e) {

    throw error(nulsBroadcastTransactionError, e);

  }

}
