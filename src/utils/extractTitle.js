function extractTitleFromHtml(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!m) return null;
  const title = m[1].replace(/\s+/g, ' ').trim();
  return title || null;
}

module.exports = { extractTitleFromHtml };