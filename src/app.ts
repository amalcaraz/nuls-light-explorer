
import api from './modules/api';
import jobs from './modules/jobs/index';
// import * as db from './services/db';
import logger from './services/logger';

export async function run() {

  try {

    // await db.connect();
    jobs();
    api(); 

  } catch (e) {

    logger.error(e);

  }

}

function exitHook(err?: any) {

  logger.info('Exiting gracefully...');

  if (err) {
    logger.error(err);
  }

  // db.close();
  process.exit(0);

}

// The app is finishing
process.on('exit', exitHook);
// Catch the SIGINT signal (Ctrl+C)
process.on('SIGINT', exitHook);
// Catch uncaught exceptions from the program
process.on('uncaughtException', exitHook);
// Catch Unhandled promise rejection from the program
process.on('unhandledRejection', exitHook);
