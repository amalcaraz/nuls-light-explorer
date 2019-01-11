import { address, blockHash, blockHeight, hash, na } from './common';

export interface Block {
  _id: {
    $oid: string;
  };
  hash: blockHash;
  preHash: hash;
  merkleHash: hash;
  time: number;
  height: blockHeight;
  txCount: number;
  packingAddress: address;
  roundIndex: number;
  consensusMemberCount: number;
  roundStartTime: number;
  packingIndexOfRound: number;
  reward: na;
  fee: na;
  confirmCount: number;
  size: number;
  scriptSig: string;
  extend: string;
}
