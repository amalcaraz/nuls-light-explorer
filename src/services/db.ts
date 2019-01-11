import * as mongodb from 'mongodb';
import { Db } from 'mongodb';
import config from './config';
import logger from './logger';

// tslint:disable-next-line:variable-name
export let _client: Db;

export const connect = async (): Promise<Db> => {

  if (_client) {
    return Promise.resolve(_client);
  }

  const MongoClient = mongodb.MongoClient;

  // Connection URL
  // tslint:disable-next-line:max-line-length
  const url: string = `${config.db.host}/${config.db.database}`;

  // Use connect method to connect to the server
  return MongoClient
    .connect(url)
    .then((mongoClient: Db) => {

      logger.debug(`Connected successfully to mongo: ${url}`);

      _client = mongoClient;
      return _client;

    })
    .catch((err: any) => {

      throw new Error(`Error conecting with mongo: ${url}` + err);

    });

};

export async function close(): Promise<void> {

  return _client
    ? _client.close()
    : Promise.resolve();

}

export const getClient = async (): Promise<Db> => {

  return _client
    ? _client
    : connect();

};

export function getDb(database: string): Promise<Db> {

  return getClient().then((cli: Db) => cli.db(database));

}
