import { NextFunction, Request, Response } from 'express';
import { defaultError, ExplorerError, IExplorerErrorResponse } from '../models/error';
import logger from '../services/logger';

export const _getErrorResponse = (e: ExplorerError): IExplorerErrorResponse => {

  const response: IExplorerErrorResponse = {
    error: e.httpCode,
    internalError: e.internalCode,
    message: e.message,
  };

  if (e.extendedMessage) {
    response.extendedMessage = e.extendedMessage;
  }

  return response;

};

export function errorController(err: Error, req: Request, res: Response, next: NextFunction) {

  const customError: ExplorerError = err instanceof ExplorerError ? err : defaultError;

  logger.error(customError);

  return res
    .status(customError.httpCode)
    .json(_getErrorResponse(customError));

}
