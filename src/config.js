/** Default settings. Every value can be overridden from the CLI. */
export const DEFAULTS = Object.freeze({
  // ~2 MB test file served by Cloudflare
  url: 'https://speed.cloudflare.com/__down?bytes=2000000',
  requests: 10,
  timeoutMs: 30_000,
  unit: 'Mbps',
});
