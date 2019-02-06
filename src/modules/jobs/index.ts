import { fork } from 'child_process';
import logger from '../../services/logger';
import config from '../../services/config';
import * as levelDb from '../../services/level';

// import fetchBlocks from './fetchBlocks';
// import parseBlocks from './parseBlocks';
import calculateUtxos from './calculateUtxos';


async function run() {

  // Init all databases in main thread

  await Promise.all(Object.keys(config.level.databases).map(async (dbName) => levelDb.connect(config.level.databases[dbName])));

  const process = [];

  process.push(fork(__dirname + '/fetchBlocks.js'));
  process.push(fork(__dirname + '/parseBlocks.js'));
  // process.push(fork(__dirname + '/calculateUtxos.js'));
  
  // fetchBlocks();
  // parseBlocks();
  calculateUtxos();

  process.forEach((p) => {

    p.on('error', (e: any) => logger.error(e));
    p.on('exit', () => logger.error(`EXIT ${p}`));

  });

}

export default run;
