import { ExplorerError } from '../models/error';

export const nulsConnectionError = new ExplorerError('50011', 500, 'Error connecting with nuls node');
export const nulsBroadcastTransactionError = new ExplorerError('50012', 500, 'Error bbroadcasting a transaction');
