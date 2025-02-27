import { TestOutput } from '../scan/results';
import { countSuppressedIssues } from '../../../../formatters/iac-output/text/utils';
import { IacAnalytics } from './index';

type IacCloudContext = Pick<
  IacAnalytics,
  | 'iacCloudContext'
  | 'iacCloudContextCloudProvider'
  | 'iacCloudContextSuppressedIssuesCount'
>;

export function getIacCloudContext(
  hasSnykCloudEnvironment: boolean,
  testOutput: TestOutput,
): IacCloudContext {
  let iacCloudContext: string | undefined;

  if (hasSnykCloudEnvironment) {
    iacCloudContext = 'snyk-cloud-environment';
  }

  let iacCloudContextSuppressedIssuesCount = 0;
  const suppressedIssues = testOutput.results?.scanAnalytics?.suppressedResults;
  if (suppressedIssues) {
    iacCloudContextSuppressedIssuesCount =
      countSuppressedIssues(suppressedIssues);
  }

  return {
    iacCloudContext,
    iacCloudContextSuppressedIssuesCount,
  };
}
