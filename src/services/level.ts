import levelup, { LevelUp } from 'levelup';
import leveldown from 'leveldown';
import config from './config';
import * as path from 'path';
import encode from 'encoding-down';
import { AbstractLevelDOWN } from 'abstract-leveldown';

let _client: Record<string, LevelUp> = {
};

export function connect(db: string): LevelUp {

  if (_client[db]) {
    return _client[db];
  }

  const p: string = path.join(config.level.path, db);
  const levelDown: AbstractLevelDOWN = encode(leveldown(p), { valueEncoding: 'json' });

  _client[db] = levelup(levelDown);

  return _client[db];
}


export function close(db: string): void {

  if (_client[db]) {
    _client[db].close();
  }

}

export function closeAll(): void {

  Object.keys(_client).forEach((db: string) => {
    _client[db].close();
  });

}