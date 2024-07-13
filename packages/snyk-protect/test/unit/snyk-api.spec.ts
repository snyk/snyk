import { getBaseApiUrl } from '../../src/lib/snyk-api';

describe('getBaseApiUrl', () => {
  it('default base api url', () => {
    const baseApiUrl = getBaseApiUrl();
    expect(baseApiUrl).toBe('https://api.snyk.io');
  });
});
