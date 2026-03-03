function buildOpts(cnfg) {
  const base = {
    timeoutMs: cnfg.TIMEOUT_MS,
    maxBytes: cnfg.MAX_BYTES,
    maxRedirects: cnfg.MAX_REDIRECTS,
    concurrency: cnfg.CONCURRENCY,
  };

  const profiles = {
    default: base,

    // fast feedback: quick failures
    fast_fail: { ...base, timeoutMs: 1000, concurrency: 3 },

    // tolerate slow sites (debugging network, redirects, etc.)
    slow_tolerant: { ...base, timeoutMs: 10000, concurrency: 5 },

    // stress server with many addresses
    stress_low_concurrency: { ...base, timeoutMs: 4000, concurrency: 1 },

    // stress outbound: many parallel fetches (watch CPU/mem)
    stress_high_concurrency: { ...base, timeoutMs: 4000, concurrency: 25 },

    // tight payload limit: forces NO RESPONSE on large pages
    tiny_max_bytes: { ...base, maxBytes: 32 * 1024 }, // 32KB

    // strict redirect policy
    no_redirects: { ...base, maxRedirects: 0 },

    // aggressive + safe-ish: quick + low bytes + low redirects
    hardened: { ...base, timeoutMs: 2000, maxBytes: 128 * 1024, maxRedirects: 2, concurrency: 5 },
  };
console.log('process.env.TEST_PROFILE', cnfg.TEST_PROFILE)
  const selected = (cnfg.TEST_PROFILE || 'default').toLowerCase();
  return profiles[selected] || profiles.default;
}

module.exports = { buildOpts };