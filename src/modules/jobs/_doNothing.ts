import logger from '../../services/logger';
import { sleep } from './utils';


async function run() {

  let i = 0;

  while(true) {

    await sleep(1);
    logger.debug(`wasting time -> ${i}`);
    i++;

  }

}

if (require.main === module) {
  run();
}
