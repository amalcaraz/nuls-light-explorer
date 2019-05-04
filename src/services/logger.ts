import * as pinoLib from 'pino';
import config from './config';

const pino = pinoLib({
  name: config.application,
  safe: true,
});

export let logger: pinoLib.Logger = pino.child({
  hostname: config.hostname,
  pid: 'master',
  level: config.logger.logLevel,
});

export default logger;
