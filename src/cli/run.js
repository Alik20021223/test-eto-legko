import { HttpClient } from '../core/HttpClient.js';
import { BenchmarkRunner } from '../core/BenchmarkRunner.js';
import { summarize } from '../core/stats.js';
import { parseCliArgs, HELP_TEXT } from './args.js';
import { formatProgress, formatReport } from './report.js';
import { UsageError } from '../errors.js';

/**
 * CLI composition root: wires parts together, owns all console output.
 * @returns {Promise<number>} process exit code
 */
export async function main(argv, { out = console.log, err = console.error } = {}) {
  try {
    const options = parseCliArgs(argv);
    if (options.help) {
      out(HELP_TEXT);
      return 0;
    }

    out(`Downloading ${options.url} x${options.requests}...`);

    const runner = new BenchmarkRunner({
      client: new HttpClient({ timeoutMs: options.timeoutMs }),
      requests: options.requests,
      onProgress: (event) => out(formatProgress(event)),
    });

    const samples = await runner.run(options.url);
    const summary = summarize(samples);

    out(formatReport({ url: options.url, unit: options.unit, summary }));
    return summary.succeeded > 0 ? 0 : 1;
  } catch (error) {
    err(error instanceof UsageError ? `Error: ${error.message}\n\n${HELP_TEXT}` : `Unexpected error: ${error.message}`);
    return error instanceof UsageError ? 2 : 1;
  }
}
