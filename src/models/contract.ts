export type ContractMethodsArgCustomType = string; // example: 'Lcom/gmail/amalcaraz89/lottery/model/Lottery;'
export type ContractMethodsArgType = 'String' | 'double' | 'long' | 'int' | 'boolean' | 'Address' | 'BigInteger';
export type ContractMethodsRetType = ContractMethodsArgType | ContractMethodsArgCustomType | 'void';

export type ContractCallArg = string | string[];
export type ContractCallArgs = ContractCallArg[];

export interface ContractMethodArg {
  type: ContractMethodsArgType;
  name: string;
  required: boolean;
};

export interface ContractMethod {
  name: string;
  desc: string;
  args: ContractMethodArg[];
  returnArg: ContractMethodsRetType;
  view: boolean;
  event: boolean;
  payable: boolean;
}

export type ContractMethodsResponse = ContractMethod[];

export interface ContractViewRequest {
  contractAddress: string;
  methodName: string;
  methodDesc?: string;
  args: ContractCallArgs;
}

export type ContractViewResponse = {
  result: string;
};

export interface ContractCallGasRequest extends ContractViewRequest {
  sender: string;
  value: number;
  price: number;
}

export type ContractCallGasResponse = {
  gasLimit: number;
};

export interface ContractCallValidateRequest extends ContractViewRequest {
  gasLimit?: number;
}

export type ContractCallValidateResponse = boolean;
