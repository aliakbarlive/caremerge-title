function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderHtmlList(results) {
  const lis = results
    .map((r) => {
      const addr = escapeHtml(r.addressOriginal);
      if (!r.ok || !r.title) return `<li>${addr} - NO RESPONSE</li>`;
      return `<li>${addr} - "${escapeHtml(r.title)}"</li>`;
    })
    .join('\n');

  return `<!doctype html>
<html>
<head></head>
<body>
  <h1>Following are the titles of given websites:</h1>
  <ul>
    ${lis}
  </ul>
</body>
</html>`;
}

module.exports = { renderHtmlList };