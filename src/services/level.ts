import levelup, { LevelUp } from 'levelup';
import config from './config';
import * as path from 'path';
// import leveldown from 'leveldown';
import rocksdb from 'rocksdb';
import encode from 'encoding-down';
import * as multilevel from 'multilevel';
import * as net from 'net';
import logger from './logger';
import * as fs from 'fs';

let _client: Record<string, Promise<LevelUp>> = {
};

export async function connect(dbConf: any): Promise<LevelUp> {

  const dbName: string = dbConf.name;
  const dbPort: number = dbConf.port;

  if (_client[dbName]) {
    return _client[dbName];
  }

  _client[dbName] = new Promise(async (resolve, reject) => {

    // logger.debug(`connecting to -> ${dbName}`);

    try {

      _client[dbName] = await clientConnect(dbPort);

    } catch (e) {

      if (e.code === 'ECONNREFUSED') {

        _client[dbName] = await serverConnect(dbName, dbPort);

      } else {

        logger.error(e);
        throw e;

      }

    }

    resolve(_client[dbName]);

  });

  return _client[dbName];

}


export async function close(db: string): Promise<void> {

  if (_client[db]) {
    (await _client[db]).close();
  }

}

export async function closeAll(): Promise<void> {

  Object.keys(_client).forEach(async (db: string) => {
    (await _client[db]).close();
  });

}

export async function serverConnect(dbName: string, dbPort: number): Promise<any> {

  return new Promise((resolve, reject) => {

    // logger.debug('SERVER CONNECTION');

    if (!fs.existsSync(config.level.path)) {
      fs.mkdirSync(config.level.path, {recursive: true});
    }

    const p: string = path.join(config.level.path, dbName);
    const db: LevelUp<any> = levelup(encode(rocksdb(p), { valueEncoding: 'json' }));

    const server = multilevel.server(db);
    server.on('error', (e: any) => logger.error(e));

    const con = net
      .createServer((con) => con.pipe(server).pipe(con))
      .listen(dbPort);

    con.on('listening', () => resolve(db));
    con.on('error', (e: any) => reject(e));

  });

}

export async function clientConnect(dbPort: number): Promise<any> {

  return new Promise((resolve, reject) => {

    // logger.debug('CLIENT CONNECTION');

    const client = multilevel.client();
    client.on('error', (e: any) => logger.error(e));
    multilevelPromiseWrapper(client);

    const rpc = client.createRpcStream();
    const con = net.connect(dbPort);
    con.pipe(rpc).pipe(con);

    con.on('connect', () => resolve(client));
    con.on('error', (e: any) => reject(e));

  });

}

function multilevelPromiseWrapper(client: any) {

  wrapCallbackIntoPromise(client, 'get');
  wrapCallbackIntoPromise(client, 'put');
  wrapCallbackIntoPromise(client, 'del');
  
  client.on('error', (e: any) => logger.error(e));

  return client;

}

function wrapCallbackIntoPromise(client: any, method: string) {

  const _method = client[method];
  client[method] = (...args: any[]) => new Promise((resolve, reject) => _method.apply(client, [...args, (error: any, success: any) => error ? reject(error) : resolve(success)]));

}
