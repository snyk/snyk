import { CLI } from '@snyk/error-catalog-nodejs-public';
import { CustomError } from './custom-error';

export class UnsupportedOptionCombinationError extends CustomError {
  private static ERROR_MESSAGE =
    'The following option combination is not currently supported: ';

  public code: number;
  public userMessage: string;

  constructor(options: string[]) {
    const msg =
      UnsupportedOptionCombinationError.ERROR_MESSAGE + options.join(' + ');
    super(msg);
    this.code = 422;
    this.userMessage = msg;
    this.errorCatalog = new CLI.InvalidFlagOptionError(msg);
  }
}
