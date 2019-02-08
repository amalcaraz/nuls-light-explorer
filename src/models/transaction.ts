import { TransactionType, TransactionObject, CoinOutputObject, CoinInputObject } from 'nuls-js';

export { TransactionType };

export type TransactionOutput = CoinOutputObject;
export type TransactionInput = CoinInputObject;

export type Transaction = TransactionObject
export type TransactionDb = Transaction;

export enum TransactionStatus {
  UnspentFree = 0,
  UnspentLocked = 1,
  Unspent = 2,
  Spent = 3,
}

// export interface TransactionInput {
//   value: na;
//   lockTime: number;
//   fromHash: hash;
//   fromIndex: number;
//   address: address;
// }

// export interface TransactionOutput {
//   value: na;
//   lockTime: number;
//   address: address;
//   status: TransactionStatus;
// }

// export interface BaseTransaction {
//   _id: {
//     $oid: string;
//   };
//   hash: transactionHash;
//   type: TransactionType;
//   time: number;
//   blockHeight: blockHeight;
//   fee: na;
//   remark: any;
//   scriptSig: string;
//   size: number;
//   info: any;
//   inputs: TransactionInput[];
//   outputs: TransactionOutput[];
// }

// export interface Transaction extends BaseTransaction {
//   txData: {
//     deposit?: na;
//     agentAddress?: address;
//     packingAddress?: address;
//     rewardAddress?: address;
//     commissionRate?: number
//   };
// }

// export interface AliasTransaction extends BaseTransaction {
//   txData: {
//     address: {
//       $binary: string;
//       $type: number;
//     };
//     alias: string;
//   };
// }

// export interface RegisterTransaction extends BaseTransaction {
//   txData: {
//     deposit: na;
//     agentAddress: address;
//     packingAddress: address;
//     rewardAddress: address;
//     commissionRate: number;
//   };
// }

// export interface DepositTransaction extends BaseTransaction {
//   txData: {
//     deposit: na;
//     address: address;
//     agentHash: agentHash;
//   };
// }

// export interface WithdrawTransaction extends BaseTransaction {
//   txData: {
//     joinTxHash: txHash;
//     address: address;
//     agentHash: agentHash;
//   };
// }

// export interface YellowCardTransaction extends BaseTransaction {
//   txData: {
//     count: number;
//     addresses: address[];
//   };
// }

// export interface RedCardTransaction extends BaseTransaction {
//   txData: {
//     address: address;
//     reason: number;
//     evidence: string;
//   };
// }
