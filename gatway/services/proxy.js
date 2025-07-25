const { createProxyMiddleware } = require('http-proxy-middleware');
const { services } = require('../config');

module.exports = function setupProxyRoutes(app) {
  Object.entries(services).forEach(([key, target]) => {
    console.log(`🔁 Proxy mounted: /${key} → ${target}`);

    app.use(
      `/${key}`,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (path, req) => path.replace(`/${key}`, ''), // 🔁 Strip /app2 → /api/...
      onProxyReq: (proxyReq, req, res) => {
  if (
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    req.headers['content-type']?.includes('application/json') &&
    req.body
  ) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }

        },
        onError(err, req, res) {
          console.error(`❌ Proxy error [${key}]:`, err.message);
          res.status(502).json({ error: `Gateway error: ${key} unreachable` });
        }
      })
    );
  });
};
