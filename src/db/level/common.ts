import * as levelDb from '../../services/level';

export interface LevelDbConfig {
  name: string;
  port: number;
}

export async function getLastKey(dbConfig: LevelDbConfig): Promise<string> {

  const db = await levelDb.connect(dbConfig);
  const iterator = (db as any).iterator({ keys: true, values: false, reverse: true, limit: 1 });

  return new Promise<string>((resolve, reject) => {

    iterator.next((e: Error, key: string) => {

      let error: Error = e;

      iterator.end((e: Error) => {

        error = e || error;

        !error && key !== undefined
          ? resolve(key)
          : reject(error);

      });

    });

  });

}