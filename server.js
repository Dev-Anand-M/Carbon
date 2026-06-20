/**
 * @fileoverview Production Node.js server to serve built static assets of the SPA
 * and handle client-side routing fallback.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  // Normalize path and remove query strings
  let filePath = path.join(DIST_DIR, req.url.split('?')[0]);

  // If path is a directory or does not have a file extension, default to index.html
  if (req.url.endsWith('/') || !path.extname(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If file not found, serve index.html (fallback for SPA routing)
      fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, fallbackContent) => {
        if (err2) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error: Ensure the project is built before starting the server.');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallbackContent);
        }
      });
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
