export interface NulsResponse {
  success: boolean;
  data: any
}

export interface NulsBlockHeaderResponse extends NulsResponse {
  data: NulsBlockHeader;
}

export interface NulsLastHeightResponse extends NulsResponse {
  data: {
    value: number;
  };
}

export interface NulsBlockBytesResponse extends NulsResponse {
  data: {
    value: string;
  };
}

export interface NulsBlockHeader {
  hash: string;
  preHash: string;
  merkleHash: string;
  stateRoot: string;
  time: number;
  height: number;
  txCount: number;
  packingAddress: string;
  extend: string;
  roundIndex: number;
  consensusMemberCount: number;
  roundStartTime: number;
  packingIndexOfRound: number;
  reward: number;
  fee: number;
  confirmCount: number;
  size: number;
  scriptSig: string;
}

export interface NulsNetInfo {
  localBestHeight: number;
  netBestHeight: number;
  timeOffset: string;
  inCount: number;
  outCount: number;
  mastUpGrade: boolean;
}

export interface NulsClientVersion {
  myVersion: string;
  newestVersion: string;
  upgradable: boolean;
  infromation: string;
  networkVersion: number;
}
