import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from '../src/core/stats.js';
import { convertSpeed, formatBytes } from '../src/core/units.js';

test('summarize: totals, average time and speed', () => {
  const summary = summarize([
    { ok: true, bytes: 1_000_000, durationMs: 500 },
    { ok: true, bytes: 1_000_000, durationMs: 1500 },
    { ok: false, error: 'timeout' },
  ]);

  assert.equal(summary.succeeded, 2);
  assert.equal(summary.failed, 1);
  assert.equal(summary.totalBytes, 2_000_000);
  assert.equal(summary.avgTimeMs, 1000);
  assert.equal(summary.bytesPerSec, 1_000_000); // 2 MB in 2 s
});

test('summarize: all requests failed -> zeros, no NaN', () => {
  const summary = summarize([{ ok: false, error: 'x' }]);
  assert.equal(summary.bytesPerSec, 0);
  assert.equal(summary.avgTimeMs, 0);
});

test('convertSpeed: 1 MB/s is 8 Mbps', () => {
  assert.equal(convertSpeed(1_000_000, 'Mbps'), 8);
  assert.equal(convertSpeed(1_000_000, 'MB/s'), 1);
  assert.throws(() => convertSpeed(1, 'bogus'), RangeError);
});

test('formatBytes', () => {
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1_500_000), '1.50 MB');
});
