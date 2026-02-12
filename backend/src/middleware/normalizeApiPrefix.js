function normalizeApiPrefix(req, res, next) {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/');
  }
  next();
}

module.exports = { normalizeApiPrefix };
