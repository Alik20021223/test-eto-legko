import { performance } from 'node:perf_hooks';
import { HttpStatusError } from '../errors.js';

/**
 * Thin wrapper over fetch that downloads a URL completely
 * and reports how many bytes arrived and how long it took.
 */
export class HttpClient {
  #timeoutMs;

  constructor({ timeoutMs }) {
    this.#timeoutMs = timeoutMs;
  }

  /**
   * @param {string} url
   * @returns {Promise<{ bytes: number, durationMs: number, status: number }>}
   */
  async download(url) {
    const startedAt = performance.now();

    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.#timeoutMs),
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) throw new HttpStatusError(response.status, response.statusText);

    // Read the body chunk by chunk: the request is finished only after the last byte.
    let bytes = 0;
    for await (const chunk of response.body) {
      bytes += chunk.byteLength;
    }

    return { bytes, durationMs: performance.now() - startedAt, status: response.status };
  }
}
