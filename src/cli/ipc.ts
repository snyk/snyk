import { writeFile } from 'fs/promises';
import { CLI, ProblemError } from '@snyk/error-catalog-nodejs-public';
import { debug as Debug } from 'debug';
import * as legacyErrors from '../lib/errors/legacy-errors';
import stripAnsi = require('strip-ansi');

const ERROR_FILE_PATH = process.env.SNYK_ERR_FILE;
const debug = Debug('snyk');

/**
 * Sends the specified error back at the Golang CLI, by writting it to the temporary error file. Errors that are not
 * inlcuded in the Error Catalog will be wraped in a generic model.
 * @param err {Error} The error to be sent to the Golang CLI
 * @param isJson {boolean} If the prameter is set, the meta field "supressJsonOutput" will also be set, supressing the Golang CLI from displaying this error.
 * @returns {Promise<boolean>} The result of the operation as a boolean value
 */
export async function sendError(err: Error, isJson: boolean): Promise<boolean> {
  if (!ERROR_FILE_PATH) {
    debug('Error file path not set.');
    return false;
  }

  // @ts-expect-error Using this instead of 'instanceof' since the error might be caught from external CLI plugins.
  // See: https://github.com/snyk/error-catalog/blob/main/packages/error-catalog-nodejs/src/problem-error.ts#L17-L19
  if (!err.isErrorCatalogError) {
    let message = legacyErrors.message(err);

    if (isJson) {
      // If the JSON flag is set, the error message field is already JSON formated, so we need to extract it from there.
      message = extractMessageFromJson(err.message);
    }

    const detail = stripAnsi(message);
    if (!detail || detail.trim().length === 0) return false;

    err = new CLI.GeneralCLIFailureError(detail, {
      suppressJsonOutput: isJson,
    });
    // @ts-expect-error Overriding the HTTP status field.
    err.metadata.status = 0;
  }

  const data = (err as ProblemError).toJsonApi().body();

  try {
    await writeFile(ERROR_FILE_PATH, JSON.stringify(data));
  } catch (e) {
    debug('Failed to write data to error file: ', e);
    return false;
  }

  return true;
}

/**
 * Extract the error message from the JSON formated errror message.
 * @param maybeJson The actual error message retrieved by parsing the maybeJson payload.
 * @returns The extracted message.
 * @example
 * Error { message: "{\"ok\":false,\"error\":\"This is the actual error message.\",\"path\":\"./\"}" }
 */
function extractMessageFromJson(maybeJson: string): string {
  try {
    const json = JSON.parse(maybeJson);
    if (json.error) return json.error;
    if (json.message) return json.message;

    // TODO: maybe just dont do IPC in this case
    throw new Error('unknown json error message field');
  } catch {
    return maybeJson; // Not actually JSON if it gets here.
  }
}
