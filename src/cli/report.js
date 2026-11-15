import { convertSpeed, formatBytes } from '../core/units.js';

/** One line printed after every finished request. */
export function formatProgress({ index, total, sample }) {
  const prefix = `[${String(index).padStart(String(total).length)}/${total}]`;
  if (!sample.ok) return `${prefix} failed: ${sample.error}`;
  return `${prefix} ${formatBytes(sample.bytes)} in ${sample.durationMs.toFixed(0)} ms`;
}

/** Final report. Pure function: takes data, returns a string. */
export function formatReport({ url, unit, summary }) {
  const lines = [
    '',
    `URL:              ${url}`,
    `Requests:         ${summary.succeeded} ok, ${summary.failed} failed (of ${summary.requests})`,
  ];

  if (summary.succeeded === 0) {
    lines.push('Speed:            n/a (no successful requests)');
    return lines.join('\n');
  }

  lines.push(
    `Total downloaded: ${formatBytes(summary.totalBytes)} (${summary.totalBytes} bytes)`,
    `Avg request time: ${summary.avgTimeMs.toFixed(0)} ms (min ${summary.minTimeMs.toFixed(0)}, max ${summary.maxTimeMs.toFixed(0)})`,
    `Download speed:   ${convertSpeed(summary.bytesPerSec, unit).toFixed(2)} ${unit}`,
  );
  return lines.join('\n');
}
