import logger from '../services/logger';
import * as nulsService from '../services/nuls';

export async function checkVersion(minVersion = '1.2.0-beta1'): Promise<boolean> {

  const pattern = /^(\d+)\.(\d+)\.(\d+)($|.+)/;

  const currentVersion: string = (await nulsService.getClientVersion()).myVersion;
  const v1 = currentVersion.match(pattern);
  const v2 = minVersion.match(pattern);

  logger.debug(`is ${currentVersion} >= ${minVersion} ?`);

  return !!v1 && !!v2 && (parseInt(v1[1]) >= parseInt(v2[1]) && parseInt(v1[2]) >= parseInt(v2[2]) && parseInt(v1[3]) >= parseInt(v2[3]));

}