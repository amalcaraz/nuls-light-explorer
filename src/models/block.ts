import { Transaction } from './transaction';
import { BlockObject } from 'nuls-js';

export interface BlockDb extends BlockObject {
  transactions: never;
  transactionHashes: string[];
}

export interface Block extends BlockObject {
  transactions: Transaction[];
  // packingAddress: address;
  // reward: na;
  // fee: na;
}

// export interface Block {
//   hash: blockHash;
//   preHash: hash;
//   merkleHash: hash;
//   time: number;
//   height: blockHeight;
//   txCount: number;
//   packingAddress: address;
//   roundIndex: number;
//   consensusMemberCount: number;
//   roundStartTime: number;
//   packingIndexOfRound: number;
//   reward: na;
//   fee: na;
//   confirmCount: number;
//   size: number;
//   scriptSig: string;
//   extend: string;
// }
