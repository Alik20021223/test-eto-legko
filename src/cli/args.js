import { parseArgs } from 'node:util';
import { DEFAULTS } from '../config.js';
import { UsageError } from '../errors.js';
import { SPEED_UNIT_NAMES } from '../core/units.js';

export const HELP_TEXT = `Usage: speedtest [url] [options]

Downloads the url several times in a row and prints the average download speed.

Arguments:
  url                  address to download (default: ${DEFAULTS.url})

Options:
  -n, --requests <n>   number of requests (default: ${DEFAULTS.requests})
  -u, --unit <unit>    speed unit: ${SPEED_UNIT_NAMES.join(' | ')} (default: ${DEFAULTS.unit})
  -t, --timeout <sec>  timeout of a single request in seconds (default: ${DEFAULTS.timeoutMs / 1000})
  -h, --help           show this help`;

/** @returns {{ help: boolean, url: string, requests: number, unit: string, timeoutMs: number }} */
export function parseCliArgs(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        requests: { type: 'string', short: 'n' },
        unit: { type: 'string', short: 'u' },
        timeout: { type: 'string', short: 't' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (error) {
    throw new UsageError(error.message);
  }

  const { values, positionals } = parsed;
  if (positionals.length > 1) throw new UsageError('Only one url can be passed');

  return {
    help: Boolean(values.help),
    url: parseUrl(positionals[0] ?? DEFAULTS.url),
    requests: parsePositiveInt(values.requests ?? DEFAULTS.requests, '--requests'),
    unit: parseUnit(values.unit ?? DEFAULTS.unit),
    timeoutMs: parsePositiveInt(values.timeout ?? DEFAULTS.timeoutMs / 1000, '--timeout') * 1000,
  };
}

function parseUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new UsageError(`Invalid url: ${raw}`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new UsageError('Only http and https urls are supported');
  }
  return url.href;
}

function parsePositiveInt(raw, optionName) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new UsageError(`${optionName} must be a positive integer, got "${raw}"`);
  }
  return value;
}

function parseUnit(raw) {
  const unit = SPEED_UNIT_NAMES.find((name) => name.toLowerCase() === String(raw).toLowerCase());
  if (!unit) throw new UsageError(`Unknown unit "${raw}". Use one of: ${SPEED_UNIT_NAMES.join(', ')}`);
  return unit;
}
