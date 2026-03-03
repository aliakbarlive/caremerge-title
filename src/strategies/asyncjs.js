const asyncLib = require('async');
const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');
const { normalizeAddress } = require('../utils/normalizeAddress');
const { extractTitleFromHtml } = require('../utils/extractTitle');

function fetchHtmlCb(urlString, opts, redirectsLeft, cb) {
  let localUrl;
  try { localUrl = new URL(urlString); } catch { return cb(new Error('Bad URL')); }
  const lib = localUrl.protocol === 'https:' ? https : http;

  const req = lib.request(
    {
      method: 'GET',
      hostname: localUrl.hostname,
      port: localUrl.port || (localUrl.protocol === 'https:' ? 443 : 80),
      path: localUrl.pathname + localUrl.search,
      headers: { 'User-Agent': 'caremerge-title-fetcher/1.0', Accept: 'text/html' },
      timeout: opts.timeoutMs,
    },
    (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (redirectsLeft <= 0) return cb(new Error('Too many redirects'));
        try {
          const next = new URL(res.headers.location, urlString).toString();
          return fetchHtmlCb(next, opts, redirectsLeft - 1, cb);
        } catch { return cb(new Error('Bad redirect')); }
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return cb(new Error(`HTTP ${res.statusCode}`));
      }

      let bytes = 0;
      const chunks = [];
      res.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > opts.maxBytes) { req.destroy(new Error('Response too large')); return; }
        chunks.push(chunk);
      });
      res.on('end', () => cb(null, Buffer.concat(chunks).toString('utf8')));
      res.on('error', cb);
    }
  );

  req.on('timeout', () => req.destroy(new Error('Timeout')));
  req.on('error', cb);
  req.end();
}

function getTitleCb(addrOriginal, opts, cb) {
  const normalized = normalizeAddress(addrOriginal);
  if (!normalized) return cb(null, { addressOriginal: addrOriginal, ok: false, title: null });

  fetchHtmlCb(normalized, opts, opts.maxRedirects, (err, html) => {
    if (err) return cb(null, { addressOriginal: addrOriginal, ok: false, title: null });
    const title = extractTitleFromHtml(html);
    return cb(null, { addressOriginal: addrOriginal, ok: Boolean(title), title });
  });
}

function run(addresses, opts, done) {
  asyncLib.mapLimit(
    addresses,
    opts.concurrency,
    (addr, cb) => getTitleCb(addr, opts, cb),
    (err, results) => done(err, results || [])
  );
}

module.exports = { run };