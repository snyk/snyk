import { Snyk } from '@snyk/error-catalog-nodejs-public';
import { CustomError } from './custom-error';

export class MonitorError extends CustomError {
  private static ERROR_MESSAGE =
    'Server returned unexpected error for the monitor request. ';

  constructor(errorCode, message) {
    const errorMessage = message ? `, response: ${message}` : '';
    const code = errorCode || 500;
    const usrMsg =
      MonitorError.ERROR_MESSAGE + `Status code: ${code}${errorMessage}`;
    super(usrMsg);
    this.code = errorCode;
    this.userMessage = message;
    this.errorCatalog = new Snyk.ServerError(usrMsg);
  }
}
