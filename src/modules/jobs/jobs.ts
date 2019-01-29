// import fetchBlocks from './fetchBlocks';
// import parseBlocks from './parseBlocks';

import { fork } from 'child_process';

async function run() {

  fork(__dirname + '/fetchBlocks.js');
  fork(__dirname + '/parseBlocks.js');
  // fork(__dirname + '/calculateUtxos.js');

}

export default run;
