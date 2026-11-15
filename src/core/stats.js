/**
 * Pure function: turns raw samples into a summary. No I/O, easy to test.
 *
 * Speed is total bytes / total time (not an average of per-request speeds),
 * so a slow big request is weighted correctly.
 *
 * @returns {{
 *   requests: number, succeeded: number, failed: number,
 *   totalBytes: number, totalTimeMs: number,
 *   avgTimeMs: number, minTimeMs: number, maxTimeMs: number,
 *   bytesPerSec: number
 * }}
 */
export function summarize(samples) {
  const successful = samples.filter((s) => s.ok);
  const times = successful.map((s) => s.durationMs);

  const totalBytes = successful.reduce((sum, s) => sum + s.bytes, 0);
  const totalTimeMs = times.reduce((sum, t) => sum + t, 0);
  const hasData = successful.length > 0 && totalTimeMs > 0;

  return {
    requests: samples.length,
    succeeded: successful.length,
    failed: samples.length - successful.length,
    totalBytes,
    totalTimeMs,
    avgTimeMs: hasData ? totalTimeMs / successful.length : 0,
    minTimeMs: hasData ? Math.min(...times) : 0,
    maxTimeMs: hasData ? Math.max(...times) : 0,
    bytesPerSec: hasData ? totalBytes / (totalTimeMs / 1000) : 0,
  };
}
