const env = require('dotenv');
env.config();

module.exports = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  STRATEGY: (process.env.STRATEGY || 'promises').toLowerCase(), // callbacks|async|promises
  TIMEOUT_MS: process.env.TIMEOUT_MS ? Number(process.env.TIMEOUT_MS) : 4000,
  MAX_BYTES: process.env.MAX_BYTES ? Number(process.env.MAX_BYTES) : 1024 * 1024,
  MAX_REDIRECTS: process.env.MAX_REDIRECTS ? Number(process.env.MAX_REDIRECTS) : 5,
  CONCURRENCY: process.env.CONCURRENCY ? Number(process.env.CONCURRENCY) : 5,
  TEST_PROFILE: (process.env.TEST_PROFILE || 'default').toLowerCase(),
};