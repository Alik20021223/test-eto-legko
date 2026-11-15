/**
 * Runs N requests strictly one after another (the next one starts
 * only when the previous one is fully downloaded or failed).
 *
 * The HTTP client is injected, so the runner can be tested without a network.
 */
export class BenchmarkRunner {
  #client;
  #requests;
  #onProgress;

  /**
   * @param {{ download(url: string): Promise<{bytes: number, durationMs: number}> }} client
   * @param {number} requests
   * @param {(event: object) => void} [onProgress]
   */
  constructor({ client, requests, onProgress = () => {} }) {
    this.#client = client;
    this.#requests = requests;
    this.#onProgress = onProgress;
  }

  /** @returns {Promise<Array<{ ok: true, bytes: number, durationMs: number } | { ok: false, error: string }>>} */
  async run(url) {
    const samples = [];

    for (let index = 1; index <= this.#requests; index += 1) {
      const sample = await this.#runOne(url);
      samples.push(sample);
      this.#onProgress({ index, total: this.#requests, sample });
    }

    return samples;
  }

  async #runOne(url) {
    try {
      const { bytes, durationMs } = await this.#client.download(url);
      return { ok: true, bytes, durationMs };
    } catch (error) {
      // One failed request must not kill the whole run.
      return { ok: false, error: describeError(error) };
    }
  }
}

/** fetch hides the real reason in error.cause (ENOTFOUND, ECONNREFUSED...). */
function describeError(error) {
  if (error.name === 'TimeoutError') return 'timeout';
  const cause = error.cause?.code ?? error.cause?.message;
  return cause ? `${error.message} (${cause})` : error.message;
}
