import { BlOCKHEIGHT_TIME_DIVIDE, address, na } from '../models/common';
import { UtxosDb, UtxoDb } from '../models/utxos';
import * as nulsService from '../services/nuls';
import * as levelDb from '../db/level/utxos';
import { nulsGetBalanceError, nulsGetUtxosError } from './error';
import { error } from '../utils/error';

export interface BalanceResponse {
  total: na;
  usable: na;
  locked: na;
}

export async function getBalance(address: address): Promise<BalanceResponse> {

  try {

    const bestHeight = await nulsService.getLastHeight();
    const utxos: UtxosDb = await levelDb.getUtxos(address);

    const balance: BalanceResponse = {
      total: 0,
      usable: 0,
      locked: 0
    };

    return utxos.reduce((prev: BalanceResponse, curr: UtxoDb): BalanceResponse => {

      if (isCoinUsable(curr.lockTime, bestHeight)) {

        prev.usable += curr.value;

      } else {

        prev.locked += curr.value;

      }

      prev.total += curr.value;

      return prev;

    }, balance);

  } catch (e) {

    throw error(nulsGetBalanceError, e);

  }

}

export async function getUtxos(address: address): Promise<UtxosDb> {

  try {

    const bestHeight = await nulsService.getLastHeight();
    const utxos: UtxosDb = await levelDb.getUtxos(address);
    return filterUsableUtxos(utxos, bestHeight);

  } catch (e) {

    throw error(nulsGetUtxosError, e);

  }

}

export function filterUsableUtxos(utxos: UtxosDb, bestHeight: number = 0): UtxosDb {

  return utxos
    .filter((utxo) => isCoinUsable(utxo.lockTime, bestHeight))
    .sort((a, b) => a.lockTime - b.lockTime);

}

export function isCoinUsable(lockTime: number, bestHeight: number = 0): boolean {

  if (lockTime < 0) {
    return false;
  }
  if (lockTime == 0) {
    return true;
  }

  const currentTime = new Date().getTime();

  if (lockTime > BlOCKHEIGHT_TIME_DIVIDE) {
    if (lockTime <= currentTime) {
      return true;
    } else {
      return false;
    }
  } else {
    if (lockTime <= bestHeight) {
      return true;
    } else {
      return false;
    }
  }

}