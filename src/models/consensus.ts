import { address, agentHash, agentNodeId, na, blockHeight, txHash } from './common';

export enum ConsensusAgentNodeStatus {
  waiting = 0,
  running = 1,
}

export enum ConsensusAgentNodeCredit {
  min = 0,
  med = 0.01,
  max = 0.8,
}

export interface ConsensusAgentNode {
  agentHash: agentHash;
  agentAddress: address;
  packingAddress: address;
  rewardAddress: address;
  deposit: na;
  commissionRate: number;
  agentName: string;
  agentId: agentNodeId;
  introduction: any;
  time: number;
  blockHeight: blockHeight;
  delHeight: number;
  status: ConsensusAgentNodeStatus;
  creditVal: number;
  totalDeposit: na;
  txHash: txHash;
  memberCount: number;
}

export interface ConsensusModel {
  _id: string;
  height: blockHeight;
  agents: ConsensusAgentNode[];
}
