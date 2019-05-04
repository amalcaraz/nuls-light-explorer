import { fork, ChildProcess } from 'child_process';
import logger from '../../services/logger';

interface CustomChildProcess extends ChildProcess {
  name?: string;
}

export interface CustomChildProcessMessage {
  type: MessageType;
  body: any;
}

export enum MessageType {
  START_ROLLBACK,
  ROLLBACK_COMPLETED,
  STOP_ALL,
  START_ALL
};

const jobs: Record<string, string> = {
  // This is the most disk I/O expensive job, so it has to run first in order to take control of the leveldb server improving the performance
  'UTXOS': __dirname + '/calculateUtxos.js',
  'ROLLBACK': __dirname + '/rollback.js',
  'FETCH': __dirname + '/fetchBlocks.js',
  'PARSE': __dirname + '/parseBlocks.js'
};
const selectedJobs: string[] = ['UTXOS', 'FETCH', 'PARSE'];

const runningJobs: Record<string, CustomChildProcess> = {};
const forkArgs = ['--max-old-space-size=8192'];

async function run() {

  // Init all databases in main thread
  // await Promise.all(Object.keys(config.level.databases).map(async (dbName) => levelDb.connect(config.level.databases[dbName])));

  startAllJobs();

}

function startAllJobs() {

  selectedJobs.map((jobName: string) => startJob(jobName));

}

function stopAllJobs() {

  Object
    .keys(runningJobs)
    .forEach((jobName: string) => stopJob(jobName));

}

function startJob(jobName: string, args: string[] = []) {

  logger.info(`START ${jobName}`);

  const p: CustomChildProcess = fork(jobs[jobName], [...args, ...forkArgs]);
  p.name = jobName;
  runningJobs[jobName] = p;

  p.on('message', (m: any) => handleMessage(p, m));
  p.on('error', (e: any) => logger.error(e));
  p.on('exit', () => {
    delete runningJobs[jobName];
    logger.info(`EXIT ${p.name}`)
  });

}

function stopJob(jobName: string) {

  runningJobs[jobName].kill('SIGINT');

}

function handleMessage(sender: CustomChildProcess, message: CustomChildProcessMessage) {

  logger.debug(`job msg [${MessageType[message.type]}]`);

  switch (message.type) {
    case MessageType.START_ROLLBACK:
      stopAllJobs();
      startJob('ROLLBACK', [message.body]);
      break;

    case MessageType.ROLLBACK_COMPLETED:
      stopAllJobs();
      startAllJobs();
      break;

    case MessageType.STOP_ALL:
    default:
      stopAllJobs();
      break;
  }

}

export default run;
