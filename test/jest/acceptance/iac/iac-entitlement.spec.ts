import { startMockServer, run as Run } from './helpers';

jest.setTimeout(50000);

describe('iac test with infrastructureAsCode entitlement', () => {
  let run: typeof Run;
  let teardown: () => void;

  beforeAll(async () => {
    const result = await startMockServer();
    run = result.run;
    teardown = result.teardown;
  });

  afterAll(async () => teardown());

  it('fails to scan because the user is not entitled to infrastructureAsCode', async () => {
    const { stdout, stderr, exitCode } = await run(
      `snyk iac test -d --org=no-iac-entitlements ./iac/terraform/sg_open_ssh.tf`,
    );
    expect(stdout).toContainText('SNYK-OPENAPI-0002');
    expect(stdout).toContainText(
      'Unsupported feature - Missing the infrastructureAsCode entitlement',
    );
    expect(stderr).toContainText('SNYK-OPENAPI-0002');
    expect(stderr).toContainText(
      'Unsupported feature - Missing the infrastructureAsCode entitlement',
    );
    expect(exitCode).toBe(2);
  });
});
