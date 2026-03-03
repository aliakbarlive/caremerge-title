function reqLogger() {
  return (req, res, next) => {
    const startNs = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startNs) / 1_000_000;
      const ts = new Date().toISOString();
      const method = req.method;
      const path = req.path || req.originalUrl || req.url;
      const status = res.statusCode;

      console.log(`${ts} ${method} ${path} ${status} ${durationMs.toFixed(2)}ms`);
    });

    next();
  };
}

module.exports = { reqLogger };