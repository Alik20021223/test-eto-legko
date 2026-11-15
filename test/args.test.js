import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCliArgs } from '../src/cli/args.js';
import { UsageError } from '../src/errors.js';

test('defaults are applied', () => {
  const options = parseCliArgs([]);
  assert.equal(options.requests, 10);
  assert.equal(options.unit, 'Mbps');
});

test('reads url and options', () => {
  const options = parseCliArgs(['http://localhost:3000/a.jpg', '-n', '3', '-u', 'mb/s', '-t', '5']);
  assert.equal(options.url, 'http://localhost:3000/a.jpg');
  assert.equal(options.requests, 3);
  assert.equal(options.unit, 'MB/s');
  assert.equal(options.timeoutMs, 5000);
});

test('rejects bad input', () => {
  assert.throws(() => parseCliArgs(['not a url']), UsageError);
  assert.throws(() => parseCliArgs(['ftp://x.com/file']), UsageError);
  assert.throws(() => parseCliArgs(['-n', '0']), UsageError);
  assert.throws(() => parseCliArgs(['-u', 'furlongs']), UsageError);
  assert.throws(() => parseCliArgs(['--nope']), UsageError);
});
