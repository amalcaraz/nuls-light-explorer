import { ExplorerError } from '../models/error';

export const nulsConnectionError = new ExplorerError('50011', 500, 'Error connecting with nuls node');
export const nulsGetBlockByHeightError = new ExplorerError('50012', 500, 'Error getting block by height');
export const nulsGetBlockByHashError = new ExplorerError('50012', 500, 'Error getting block by hash');
export const nulsGetTransactionByHashError = new ExplorerError('50012', 500, 'Error getting transaction by hash');
export const nulsBroadcastTransactionError = new ExplorerError('50013', 500, 'Error broadcasting a transaction');
