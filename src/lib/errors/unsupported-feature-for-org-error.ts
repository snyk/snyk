import { OpenAPI } from '@snyk/error-catalog-nodejs-public';
import { CustomError } from './custom-error';

export class FeatureNotSupportedForOrgError extends CustomError {
  public readonly org: string;

  constructor(org: string, feature = 'Feature', additionalUserHelp = '') {
    const msg =
      `${feature} is not supported for org` +
      (org ? ` ${org}` : '') +
      (additionalUserHelp ? `: ${additionalUserHelp}` : '.');
    super(`Unsupported action for org ${org}.`);
    this.code = 422;
    this.org = org;
    this.userMessage = msg;
    this.errorCatalog = new OpenAPI.ForbiddenError(msg);
  }
}
