export interface IExplorerError extends Error {
  internalCode: string;
  httpCode: number;
  message: string;
  extendedMessage: string;
  errorStack: ExplorerError[];
}

export interface IExplorerErrorResponse {
  error: number;
  internalError: string;
  message: string;
  extendedMessage?: string;
}

export class ExplorerError extends Error implements IExplorerError {

  private static prefix: string = 'NLE-';

  public name: string = 'ExplorerError';
  public errorStack: ExplorerError[] = [];

  constructor(
    public internalCode: string,
    public httpCode: number,
    public message: string,
    public extendedError?: ExplorerError | Error) {

    super();
    this.internalCode = `${ExplorerError.prefix}${internalCode}`;

  }

  get extendedMessage(): string {
    return this.extendedError ? (`${this.extendedError.name}: ${this.extendedError.message}`) : '';
  }

}

export const defaultError = new ExplorerError('50000', 500, 'Internal error');
export const dbError = new ExplorerError('50001', 500, 'Error fetching from database');
export const badRequestError = new ExplorerError('40000', 400, 'Bad request');
export const dltError = new ExplorerError('50300', 503, 'Service Unavailable');
export const notFoundError = new ExplorerError('40400', 404, 'Not Found');
