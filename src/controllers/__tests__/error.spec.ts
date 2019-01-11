import 'jest';
import logger from '../../utils/logger';
import * as errors from '../error';
import { defaultError, ExplorerError, IExplorerErrorResponse } from './../../models/error';

jest.mock('../../utils/config');
jest.mock('../../utils/logger');

describe('errorController', async () => {

  beforeEach(() => {

    jest.clearAllMocks();

  });

  describe('::_getErrorResponse', () => {

    it('should return the correct error response given a ExplorerError', async () => {

      const error: ExplorerError = new ExplorerError('1111', 500, 'Custom error');

      const result: IExplorerErrorResponse = await errors._getErrorResponse(error);

      expect(result).toEqual({
        error: 500,
        internalError: 'HKWH1111',
        message: 'Custom error',
      });

    });

    it('should return the default status code and error body when the given error is not matched', async () => {

      const extendedError: Error = new Error('Extended boom!');
      const error: ExplorerError = new ExplorerError('1111', 500, 'Custom error', extendedError);

      const result: IExplorerErrorResponse = await errors._getErrorResponse(error);

      expect(result).toEqual({
        error: 500,
        internalError: 'HKWH1111',
        message: 'Custom error',
        extendedMessage: 'Error: Extended boom!',
      });

    });

  });

  describe('::errorController', () => {

    let req: any;
    let res: any;
    let next: any;
    let _getResponseMock: jest.Mock;
    const mockerErrorResponse: IExplorerErrorResponse = {} as any;

    beforeEach(() => {

      req = {};

      res = {
        json: jest.fn(),
        status: jest.fn().mockImplementation(() => res),
      };

      next = jest.fn();

      _getResponseMock = jest.spyOn(errors, '_getErrorResponse').mockReturnValue(mockerErrorResponse);

    });

    it('should return the correct status code and error body given an specific error', async () => {

      const error: ExplorerError = new ExplorerError('1111', 500, 'Custom error');
      await errors.errorController(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(error.httpCode);
      expect(_getResponseMock).toHaveBeenCalledWith(error);
      expect(res.json).toHaveBeenCalledWith(mockerErrorResponse);
      expect(logger.error).toHaveBeenCalledWith(error);

    });

    it('should return the default status code and error body when the given error is not matched', async () => {

      const error: Error = new Error('WHATEVER');
      await errors.errorController(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(defaultError.httpCode);
      expect(_getResponseMock).toHaveBeenCalledWith(defaultError);
      expect(res.json).toHaveBeenCalledWith(mockerErrorResponse);
      expect(logger.error).toHaveBeenCalledWith(defaultError);

    });

  });

});
