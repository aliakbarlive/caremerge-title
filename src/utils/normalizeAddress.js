const { URL } = require('node:url');

function normalizeAddress(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  const candidate = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;

  try {
    const localUrl = new URL(candidate);
    if (localUrl.protocol !== 'http:' && localUrl.protocol !== 'https:') return null;
    return localUrl.toString();
  } catch {
    return null;
  }
}

module.exports = { normalizeAddress };