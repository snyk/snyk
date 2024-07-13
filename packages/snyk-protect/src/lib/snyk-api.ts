export function getApiBaseUrl(): string {
  const apiBaseUrl = 'https://api.snyk.io';
  const envvarDefinedApiUrl = process.env.SNYK_API;

  if (envvarDefinedApiUrl) {
    try {
      const parsedEndpoint = new URL(envvarDefinedApiUrl);
      if (!parsedEndpoint || !parsedEndpoint.protocol || !parsedEndpoint.host) {
        throw new Error('malformed endpoint');
      }

      if (parsedEndpoint.host.startsWith('app.')) {
        // Rewrite app.snyk.io to api.snyk.io
        parsedEndpoint.host = parsedEndpoint.host.replace(/^app\./, 'api.');
      } else if (
        // Ignore localhosts and URLs with api. already defined
        !parsedEndpoint.host.startsWith('localhost') &&
        !parsedEndpoint.host.startsWith('api.')
      ) {
        // Otherwise add the api. subdomain
        parsedEndpoint.host = 'api.' + parsedEndpoint.host;
      }

      ['/v1', '/api'].forEach((elem) => {
        if (parsedEndpoint.pathname.endsWith(elem)) {
          parsedEndpoint.pathname = parsedEndpoint.pathname.slice(
            0,
            -elem.length,
          );
        }
      });

      return parsedEndpoint.toString();
    } catch (error) {
      console.warn(
        'Malformed SNYK_API value. Using default: https://api.snyk.io',
      );
    }
  }

  return apiBaseUrl;
}
