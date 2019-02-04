import { hashLength } from '../models/common';

const hashRegexp = new RegExp(`^00([0-9a-fA-F]{${hashLength - 2}})$`);

export function isHash(hash: string) {

  return hashRegexp.test(hash);
  
}