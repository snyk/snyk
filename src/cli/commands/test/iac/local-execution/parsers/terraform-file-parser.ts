import { IaCErrorCodes } from '../types';
import { CustomError } from '../../../../../../lib/errors';
import { getErrorStringCode } from '../error-utils';
import { CLI } from '@snyk/error-catalog-nodejs-public';

export class FailedToParseTerraformFileError extends CustomError {
  public filename: string;
  constructor(filename: string) {
    const usrMsg = `We were unable to parse the Terraform file "${filename}", please ensure it is valid HCL2. This can be done by running it through the 'terraform validate' command.`;
    super('Failed to parse Terraform file');
    this.code = IaCErrorCodes.FailedToParseTerraformFileError;
    this.strCode = getErrorStringCode(this.code);
    this.filename = filename;
    this.userMessage = usrMsg;
    this.errorCatalog = new CLI.GeneralIACFailureError(usrMsg);
  }
}
