import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { main } from '../src/cli/run.js';
import { BenchmarkRunner } from '../src/core/BenchmarkRunner.js';

const PAYLOAD = Buffer.alloc(200_000, 1);

function startServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/missing') {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Length': PAYLOAD.length }).end(PAYLOAD);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

test('CLI downloads the file N times and prints the report', async (t) => {
  const server = await startServer();
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const lines = [];
  const code = await main([`${base}/file`, '-n', '4'], { out: (l) => lines.push(l), err: (l) => lines.push(l) });
  const output = lines.join('\n');

  assert.equal(code, 0);
  assert.match(output, /4 ok, 0 failed/);
  assert.match(output, /800000 bytes/); // 4 x 200 000
  assert.match(output, /Download speed: +[\d.]+ Mbps/);
});

test('HTTP errors are counted as failures and exit code is 1', async (t) => {
  const server = await startServer();
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const lines = [];
  const code = await main([`${base}/missing`, '-n', '2'], { out: (l) => lines.push(l), err: (l) => lines.push(l) });

  assert.equal(code, 1);
  assert.match(lines.join('\n'), /0 ok, 2 failed/);
});

test('runner makes requests strictly one after another', async () => {
  let active = 0;
  let maxActive = 0;
  const client = {
    async download() {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 5));
      active -= 1;
      return { bytes: 1, durationMs: 5 };
    },
  };

  const samples = await new BenchmarkRunner({ client, requests: 5 }).run('http://x');
  assert.equal(samples.length, 5);
  assert.equal(maxActive, 1);
});
