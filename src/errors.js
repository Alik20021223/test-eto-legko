/** Wrong CLI arguments (bad URL, bad number, unknown unit...). */
export class UsageError extends Error {
  name = 'UsageError';
}

/** The server answered with a non-2xx status. */
export class HttpStatusError extends Error {
  name = 'HttpStatusError';

  constructor(status, statusText) {
    super(`HTTP ${status} ${statusText}`.trim());
    this.status = status;
  }
}
