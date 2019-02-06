import { na } from './common';

export interface UtxoDb {
  fromHash: string;
  fromIndex: number;
  value: na;
  lockTime: number;
}

export type UtxosDb = UtxoDb[];
