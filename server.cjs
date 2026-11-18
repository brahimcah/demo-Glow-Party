const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || process.argv[2] || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const MIMES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=UTF-8',
};

function resolveFile(pathname) {
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  
  const candidates = [
    path.join(ROOT_DIR, safePath),
    path.join(DIST_DIR, safePath),
    path.join(ROOT_DIR, 'assets', path.basename(safePath)),
    path.join(DIST_DIR, 'assets', path.basename(safePath)),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  const indexCandidates = [
    path.join(DIST_DIR, 'index.html'),
    path.join(ROOT_DIR, 'index.html'),
  ];
  for (const idx of indexCandidates) {
    if (fs.existsSync(idx) && fs.statSync(idx).isFile()) {
      return idx;
    }
  }

  return null;
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(reqUrl.pathname || '/');

  if (pathname === '/healthz' || pathname === '/_status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', node: process.version, time: new Date().toISOString() }));
    return;
  }

  const filePath = resolveFile(pathname === '/' ? 'index.html' : pathname);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIMES[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    'X-Powered-By': 'GlowParty-Node-Server',
  });

  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`[Glow Party] Node.js server running at http://${HOST}:${PORT}/`);
});
