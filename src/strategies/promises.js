const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');
const { normalizeAddress } = require('../utils/normalizeAddress');
const { extractTitleFromHtml } = require('../utils/extractTitle');

function requestOnce(urlString, opts) {
  const localUrl = new URL(urlString);
  const lib = localUrl.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        method: 'GET',
        hostname: localUrl.hostname,
        port: localUrl.port || (localUrl.protocol === 'https:' ? 443 : 80),
        path: localUrl.pathname + localUrl.search,
        headers: { 'User-Agent': 'caremerge-title-fetcher/1.0', Accept: 'text/html' },
        timeout: opts.timeoutMs,
      },
      (res) => resolve({ res, baseUrl: urlString })
    );

    req.on('timeout', () => req.destroy(new Error('Timeout')));
    req.on('error', reject);
    req.end();
  }).then(({ res, baseUrl }) => {
    return new Promise((resolve, reject) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        try { return resolve({ redirect: new URL(res.headers.location, baseUrl).toString() }); }
        catch { return reject(new Error('Bad redirect')); }
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      let bytes = 0;
      const chunks = [];
      res.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > opts.maxBytes) { res.destroy(new Error('Response too large')); return; }
        chunks.push(chunk);
      });
      res.on('end', () => resolve({ body: Buffer.concat(chunks).toString('utf8') }));
      res.on('error', reject);
    });
  });
}

async function fetchHtml(urlString, opts) {
  let current = urlString;
  for (let i = 0; i <= opts.maxRedirects; i++) {
    const out = await requestOnce(current, opts);
    if (out.redirect) { current = out.redirect; continue; }
    return out.body;
  }
  throw new Error('Too many redirects');
}

async function getTitle(addressOriginal, opts) {
  const normalized = normalizeAddress(addressOriginal);
  if (!normalized) return { addressOriginal, ok: false, title: null };

  try {
    const html = await fetchHtml(normalized, opts);
    const title = extractTitleFromHtml(html);
    return { addressOriginal, ok: Boolean(title), title };
  } catch {
    return { addressOriginal, ok: false, title: null };
  }
}

async function run(addresses, opts) {
  const results = new Array(addresses.length);
  let next = 0;

  async function worker() {
    while (true) {
      const i = next++;
      if (i >= addresses.length) return;
      results[i] = await getTitle(addresses[i], opts);
    }
  }

  const n = Math.min(opts.concurrency, addresses.length || 1);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

module.exports = { run };