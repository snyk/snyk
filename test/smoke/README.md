# Snyk CLI Smoke Tests

Design goal is to have a single test suite, that can detect if CLI is not working properly - before and after it's released. Defects it should catch are e.g. [broken pkg builds for a specific platform](https://github.com/snyk/snyk/issues/670), [misaligned dependencies](https://github.com/snyk/snyk/issues/1261) or [issues with a specific installation targets](https://github.com/snyk/snyk/issues/1270).

Spec in this folder is used as a

1. **"Smoke test" step in CircleCI** to verify that built CLI can run
2. **["Smoke Tests"](https://github.com/snyk/snyk/actions?query=workflow%3A%22Smoke+Tests%22) GitHub Action** to verify that our distribution channels are working.

## How to add a new smoke test

Smoke tests should be fast. Ideally tests only things that could break when CLI is being built and packaged into binaries. Functionality should be tested our _other_ tests.

It's recommended to have a branch named `smoke/_SOMETHING_`, as [this branch will run the GitHub Action](https://github.com/snyk/snyk/blob/f35f39e96ef7aa69b22a846315dda015b12a4564/.github/workflows/smoke-tests.yml#L3-L5).

To run these tests locally you may use `npm run test:smoke`:

1. Install:

   - timeout (if not available on your platform)

2. Install dependencies for the local fixture `test/fixtures/basic-npm` with `npm install --prefix test/fixtures/basic-npm`

From the root of the `snyk` repo, run:

```sh
npm run test:smoke
```

### Notes on the local run

`REGRESSION_TEST=1` enables the extended mode we use for regression testing. For the hourly tests in GitHub Actions we use a limited scope of tested commands.

You may specify an envvar `TEST_SNYK_COMMAND` to any executable that will be used by Smoke tests. E.g. a local exuctable `SNYK_COMMAND="./snyk-macos"` or an `SNYK_COMMAND="npx snyk@1.500.0"` or `SNYK_COMMAND="node ./dist/cli"` for local execution.

This will meddle with your `snyk config` file as Smoke Tests are checking functionality of `snyk config` command.

This will open a browser in one instance unless it's disabled with `SMOKE_TESTS_SKIP_TEST_THAT_OPENS_BROWSER=1` envvar. Opening of a browser is disabled by default when running Smoke tests with npm command `npm run test:smoke`.

## Current workarounds and limitations

### Alpine

- Needs to run in a Docker container because GitHub Actions don't support Alpine as a host OS. Using shellspec container, as it's based on alpine and ready to run the tests.
- Need to skip a test that normally tries to open browser for login, but that fails horribly on Alpine.

To run the Alpine test in Docker locally (you probably don't want to…):

```
 docker build -f ./test/smoke/alpine/Dockerfile -t snyk-cli-alpine ./test/ && docker run --rm -eTEST_SNYK_TOKEN=$SNYK_API_TOKEN snyk-cli-alpine
```

_Note: Alpine image is not copying/mounting everything, so you might need to add anything new to the `test/smoke/alpine/Dockerfile`_
