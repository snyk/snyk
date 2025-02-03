import { ProblemError } from '@snyk/error-catalog-nodejs-public';
import { CustomError } from './custom-error';
import { CLI } from '@snyk/error-catalog-nodejs-public';

export class FailedToRunTestError extends CustomError {
  private static ERROR_MESSAGE = 'Failed to run a test';
  public innerError: any | undefined;

  constructor(
    userMessage,
    errorCode?,
    innerError?: any,
    errorCatalog?: ProblemError,
  ) {
    const code = errorCode || 500;
    const msg = userMessage || FailedToRunTestError.ERROR_MESSAGE;
    super(msg);
    this.code = errorCode || code;
    this.userMessage = msg;
    this.innerError = innerError;
    this.errorCatalog = errorCatalog ?? new CLI.GeneralCLIFailureError(msg);
  }
}
