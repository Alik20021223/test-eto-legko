const BITS_IN_BYTE = 8;

/**
 * Supported speed units. Decimal (SI) prefixes are used, like ISPs do:
 * 1 Mbps = 1 000 000 bits per second, 1 MB/s = 1 000 000 bytes per second.
 */
export const SPEED_UNITS = Object.freeze({
  Mbps: { label: 'Mbps', description: 'megabits per second', fromBytesPerSec: (bps) => (bps * BITS_IN_BYTE) / 1e6 },
  'MB/s': { label: 'MB/s', description: 'megabytes per second', fromBytesPerSec: (bps) => bps / 1e6 },
  'KB/s': { label: 'KB/s', description: 'kilobytes per second', fromBytesPerSec: (bps) => bps / 1e3 },
});

export const SPEED_UNIT_NAMES = Object.keys(SPEED_UNITS);

/** Converts bytes/second to the requested unit. */
export function convertSpeed(bytesPerSec, unitName) {
  const unit = SPEED_UNITS[unitName];
  if (!unit) throw new RangeError(`Unknown unit: ${unitName}`);
  return unit.fromBytesPerSec(bytesPerSec);
}

/** Human readable size: 1536 -> "1.54 KB" (decimal, same prefixes as speed). */
export function formatBytes(bytes) {
  const steps = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let i = 0;
  while (value >= 1000 && i < steps.length - 1) {
    value /= 1000;
    i += 1;
  }
  return `${i === 0 ? value : value.toFixed(2)} ${steps[i]}`;
}
