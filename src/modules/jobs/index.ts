import { fork } from 'child_process';
import logger from '../../services/logger';
// import config from '../../services/config';
// import * as levelDb from '../../services/level';
// import fetchBlocks from './fetchBlocks';
// import parseBlocks from './parseBlocks';
// import calculateUtxos from './calculateUtxos';

const forkArgs = ['--max-old-space-size=8192'];

async function run() {

  // Init all databases in main thread
  // await Promise.all(Object.keys(config.level.databases).map(async (dbName) => levelDb.connect(config.level.databases[dbName])));

  const process = [];

  // This is the most disk I/O expensive job, so it has to run first in order to take control of the leveldb server improving the performance
  process.push(fork(__dirname + '/calculateUtxos.js', forkArgs));

  // process.push(fork(__dirname + '/fetchBlocks.js', forkArgs));
  process.push(fork(__dirname + '/parseBlocks.js', forkArgs));

  // fetchBlocks();
  // parseBlocks();
  // calculateUtxos();

  process.forEach((p) => {

    p.on('error', (e: any) => logger.error(e));
    p.on('exit', () => logger.error(`EXIT ${p}`));

  });

}

export default run;
