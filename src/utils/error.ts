import { ExplorerError } from '../models/error';

export function error(explorerError: ExplorerError, originalError?: ExplorerError | Error): ExplorerError {

  let retError: ExplorerError = explorerError;

  if (originalError instanceof ExplorerError) {

    retError = originalError;
    retError.errorStack.push(explorerError);

  } else {

    retError.extendedError = originalError;

  }

  return retError;

}
