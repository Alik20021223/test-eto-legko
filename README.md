# speedtest-cli

Console tool for measuring download speed. It makes 10 sequential HTTP requests to a given URL, waits for the full response of each one, and prints the average request time, the total amount of downloaded data and the download speed.

No dependencies, only the Node.js standard library.

## Requirements

Node.js 18 or newer (uses built-in `fetch`).

## Run

```bash
git clone <repo-url>
cd speedtest-cli

# default test file (~10 MB from Cloudflare)
node bin/speedtest.js

# your own address, e.g. a heavy image
node bin/speedtest.js https://example.com/big-image.jpg

# options
node bin/speedtest.js https://example.com/big-image.jpg -n 5 -u MB/s -t 60
```

Also works as `npm start -- <url>`.

| Option | Description | Default |
| --- | --- | --- |
| `[url]` | address to download (http or https) | Cloudflare 10 MB file |
| `-n, --requests` | number of requests | `10` |
| `-u, --unit` | speed unit: `Mbps`, `MB/s`, `KB/s` | `Mbps` |
| `-t, --timeout` | timeout of one request, seconds | `30` |
| `-h, --help` | help | |

Exit codes: `0` ok, `1` all requests failed, `2` wrong arguments.

## Units

By default the speed is printed in **Mbps (megabits per second)**, the unit that internet providers use.
Decimal prefixes are used everywhere: 1 Mbps = 1 000 000 bits/s, 1 MB/s = 1 000 000 bytes/s, so **1 MB/s = 8 Mbps**.
Other units are available with `--unit`: `MB/s` and `KB/s`.

## Example output

```
Downloading http://127.0.0.1:8765/big.bin x10...
[ 1/10] 5.00 MB in 58 ms
[ 2/10] 5.00 MB in 17 ms
...
[10/10] 5.00 MB in 6 ms

URL:              http://127.0.0.1:8765/big.bin
Requests:         10 ok, 0 failed (of 10)
Total downloaded: 50.00 MB (50000000 bytes)
Avg request time: 16 ms (min 6, max 58)
Download speed:   2434.17 Mbps
```

(This one is from a local server, so the number is huge. Over the real internet it will be much lower.)

## How it is measured

- Requests go strictly one after another: the next starts only after the previous body is fully read.
- Time of a request = from sending it to receiving the last byte (`performance.now()`).
- Speed = total bytes / total time of successful requests. This is not an average of per-request speeds, so a slow large request is weighted correctly.
- A failed request (timeout, network error, non-2xx status) is reported and skipped, the run continues. Failed requests are not included in the stats.

## Project structure

```
bin/speedtest.js          entry point (3 lines)
src/
  config.js               default values
  errors.js               UsageError, HttpStatusError
  core/                   logic, no console output
    HttpClient.js         downloads a URL fully, returns bytes + time
    BenchmarkRunner.js    runs N sequential requests, collects samples
    stats.js              pure function: samples -> summary
    units.js              unit conversion and byte formatting
  cli/                    everything about the console
    args.js               argument parsing and validation
    report.js             text formatting of progress and final report
    run.js                wires everything together, owns console output
test/                     node:test, includes a local HTTP server
```

The core knows nothing about the console, and the CLI knows nothing about how requests are made. `BenchmarkRunner` gets its HTTP client from outside, so it is tested without a network.

## Tests

```bash
npm test
```
