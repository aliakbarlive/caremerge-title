const express = require('express');
const { renderHtmlList } = require('../utils/renderHtml');

function makeTitleRoute({ runner, opts }) {
  const router = express.Router();

  router.get('/I/want/title', async (req, res) => {
    const raw = req.query.address;
    const addresses = Array.isArray(raw) ? raw.map(String) : raw ? [String(raw)] : [];

    try {
      let results;
      if (runner.kind === 'cb') {
        results = await new Promise((resolve, reject) =>
          runner.run(addresses, opts, (err, r) => (err ? reject(err) : resolve(r)))
        );
      } else {
        results = await runner.run(addresses, opts);
      }

      res.status(200).type('html').send(renderHtmlList(results));
    } catch (err) {
      console.error('Error processing title request:', err);
      const fallback = addresses.map((a) => ({ addressOriginal: a, ok: false, title: null }));
      res.status(200).type('html').send(renderHtmlList(fallback));
    }
  });

  return router;
}

module.exports = { makeTitleRoute };