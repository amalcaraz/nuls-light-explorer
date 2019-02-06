import * as levelDb from '../../services/level';
import logger from '../../services/logger';

export interface LevelDbConfig {
  name: string;
  port: number;
}

export async function getLastKey(dbConfig: LevelDbConfig): Promise<string> {

  try {

    const db = await levelDb.connect(dbConfig);
    const stream = (db as any).createReadStream({ keys: true, values: false, reverse: true, limit: 1 });

    return new Promise<string>((resolve, reject) => {

      let key: string;

      stream
        .on('data', (k: string) => key = k)
        .on('error', (e: Error) => reject(e))
        .on('end', () => key !== undefined ? resolve(key) : reject());

    });

  } catch (e) {

    logger.error(`Error getLastKey ${e}`);
    throw e;

  }

}