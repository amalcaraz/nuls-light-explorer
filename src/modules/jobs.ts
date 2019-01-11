import { getLastHeight } from '../services/nuls';

export async function run() {

  const lastHeight: number = await getLastHeight();

  console.log(lastHeight);

}

export default run;
