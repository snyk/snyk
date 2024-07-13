/*
  This file is trying to make sense from different Snyk API URLs configurations

  API URL settings could be defined in a few ways:
  - snyk config file with key "endpoint" (including override with SNYK_CFG_ENDPOINT envvar!)
  - SNYK_API envvar
  - Snyk REST API had their own envvars to be set

  And API URL itself could (currently) point to multiple places
  - https://snyk.io/api/v1 (old default)
  - https://snyk.io/api
  - https://app.snyk.io/api
  - https://app.snyk.io/api/v1
  - https://api.snyk.io/v1

  For Snyk REST API it's a bit simpler:
  - https://api.snyk.io/rest


  There are also other URLs - one for the snyk auth command, one for Snyk Code Proxy

  Idea is to configure a single URL and derive the rest from it.
  This file handles an internal concept of a Base URL and logic needed to derive the other URLs
  In a backwards compatible way.
*/

import * as Debug from 'debug';
import { color } from '../theme';

const debug = Debug('snyk');
const defaultApiUrl = 'https://api.snyk.io';

/**
 * @description Get a Base URL for Snyk APIs
 * @export
 * @param {(string | undefined)} envvarDefinedApiUrl if there is an URL defined in the SNYK_API envvar
 * @param {(string | undefined)} configDefinedApiUrl if there is an URL defined in the 'endpoint' key of the config
 * @returns {string} Returns a Base URL - without the /v1. Use this to construct derived URLs
 */
export function getBaseApiUrl(
  envvarDefinedApiUrl?: string,
  configDefinedApiUrl?: string,
): string {
  // Use SNYK_API envvar by default
  if (envvarDefinedApiUrl) {
    return getBaseUrlOrReturnDefault(
      envvarDefinedApiUrl,
      '',
      "'SNYK_API' environment variable",
      defaultApiUrl,
    );
  }

  if (configDefinedApiUrl) {
    return getBaseUrlOrReturnDefault(
      configDefinedApiUrl,
      '',
      "'endpoint' config option. See 'snyk config' command. The value of 'endpoint' is currently set as",
      defaultApiUrl,
    );
  }

  return defaultApiUrl; // Fallback to default
}

/**
 * @description Macro to validate user-defined URL and fallback to default if needed
 * @param {string} urlString "dirty" user defined string coming from config, envvar or a flag
 * @param {string} optionName For formatting error messages
 * @param {string} defaultUrl What to return if urlString does not pass
 * @returns {string}
 */
function getBaseUrlOrReturnDefault(
  urlString: string,
  pathname: string,
  optionName: string,
  defaultUrl: string,
): string {
  const parsedEndpoint = parseURLWithoutThrowing(urlString);
  // Endpoint option must be a valid URL including protocol
  if (!parsedEndpoint || !parsedEndpoint.protocol || !parsedEndpoint.host) {
    console.error(
      color.status.error(
        `Invalid ${optionName} '${urlString}'. Value must be a valid URL including protocol. Using default Snyk API URL '${defaultUrl}'`,
      ),
    );
    return defaultUrl;
  }

  if (parsedEndpoint.host.startsWith('app.')) {
    // Rewrite app.snyk.io to api.snyk.io
    parsedEndpoint.host = parsedEndpoint.host.replace(/^app\./, 'api.');
  } else if (
    // Ignore localhosts and URLs with api. already defined
    !parsedEndpoint.host?.startsWith('localhost') &&
    !parsedEndpoint.host?.startsWith('api.')
  ) {
    // Otherwise add the api. subdomain
    parsedEndpoint.host = 'api.' + parsedEndpoint.host;
  }

  parsedEndpoint.pathname = pathname;
  urlString = parsedEndpoint.toString();

  // TODO: this debug is not printed when using the --debug flag, because flags are parsed after config. Making it async works around this
  setTimeout(
    () => debug(`Using a custom Snyk API ${optionName} '${urlString}'`),
    1,
  );
  return urlString;
}

function parseURLWithoutThrowing(urlString: string): URL | undefined {
  try {
    return new URL(urlString);
  } catch (error) {
    return undefined;
  }
}

export function getV1ApiUrl(baseApiUrl: string): string {
  return baseApiUrl + '/v1';
}

/**
 * @description Return Snyk REST API URL
 * @export
 * @param {string} baseApiUrl
 * @param {string} envvarDefinedRestApiUrl
 * @param {string} envvarDefinedRestV3Url
 * @returns {string}
 */
export function getRestApiUrl(
  baseApiUrl: string,
  envvarDefinedRestApiUrl?: string,
  envvarDefinedRestV3Url?: string,
): string {
  // REST API URL should always look like this: https://api.$DOMAIN/rest
  const pathname = '/rest';
  const defaultRestApiUrl = baseApiUrl + pathname;

  // TODO: notify users they can set just the (SNYK_)API envvar
  if (envvarDefinedRestV3Url) {
    return getBaseUrlOrReturnDefault(
      envvarDefinedRestV3Url,
      pathname,
      "'SNYK_API_V3_URL' environment variable",
      defaultRestApiUrl,
    );
  }

  if (envvarDefinedRestApiUrl) {
    return getBaseUrlOrReturnDefault(
      envvarDefinedRestApiUrl,
      pathname,
      "'SNYK_API_REST_URL' environment variable",
      defaultRestApiUrl,
    );
  }

  return defaultRestApiUrl; // Fallback to default
}

export function getHiddenApiUrl(restUrl: string): string {
  const parsedBaseUrl = new URL(restUrl);
  parsedBaseUrl.pathname = '/hidden';
  return parsedBaseUrl.toString();
}

export function getRootUrl(apiUrlString: string): string {
  // based on https://docs.snyk.io/snyk-processes/data-residency-at-snyk#what-regions-are-available the pattern is as follows
  // https://app.[region.]snyk.io
  // given an api url that starts with api means, that we can replace "api" by "app".
  const rootUrl = apiUrlString.replace(/api\./, 'app.');
  return rootUrl;
}
