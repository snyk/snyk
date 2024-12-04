import { TestConfig } from './types';
import { resultsFromOutputFile, scan } from './scan';
import { TestOutput } from './scan/results';
import { initLocalCache } from './local-cache';
import { addIacAnalytics } from './analytics';
import * as newDebug from 'debug';

export { TestConfig } from './types';

const debug = newDebug('snyk-iac');

export async function test(testConfig: TestConfig): Promise<TestOutput> {
  let testOutput: TestOutput;
  if (testConfig.iacOutputFile) {
    testOutput = await resultsFromOutputFile(testConfig.iacOutputFile);
  } else {
    const { policyEnginePath, rulesBundlePath, rulesClientURL } =
      await initLocalCache(testConfig);

    debug(`[SERGIU] policyEnginePath: ${policyEnginePath}`);

    testOutput = await scan(
      testConfig,
      policyEnginePath,
      rulesBundlePath,
      rulesClientURL,
    );
  }

  addIacAnalytics(testConfig, testOutput);

  return testOutput;
}
