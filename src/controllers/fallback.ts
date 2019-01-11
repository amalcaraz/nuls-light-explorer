import { NextFunction, Request, Response } from 'express';
import { notFoundError } from '../models/error';
import { errorController } from './error';

export function fallbackController(req: Request, res: Response, next: NextFunction) {

  return errorController(notFoundError, req, res, next);

}
