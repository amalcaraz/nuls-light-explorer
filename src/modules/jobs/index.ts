import { fork } from 'child_process';

function run() {

  fork(__dirname + '/fetchBlocks.js');
  fork(__dirname + '/parseBlocks.js');
  // fork(__dirname + '/calculateUtxos.js');

}

export default run;
