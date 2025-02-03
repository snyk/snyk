import { OpenAPI } from '@snyk/error-catalog-nodejs-public';
import { CustomError } from './custom-error';

export class UnsupportedEntitlementError extends CustomError {
  public readonly entitlement: string;

  private static ERROR_CODE = 403;

  constructor(
    entitlement: string,
    userMessage = `This feature is currently not enabled for your org. To enable it, please contact snyk support.`,
  ) {
    const msg = `Unsupported feature - Missing the ${
      entitlement ? entitlement : 'required'
    } entitlement`;
    super(msg);
    this.entitlement = entitlement;
    this.code = UnsupportedEntitlementError.ERROR_CODE;
    this.userMessage = userMessage;
    this.errorCatalog = new OpenAPI.ForbiddenError(msg);
  }
}
