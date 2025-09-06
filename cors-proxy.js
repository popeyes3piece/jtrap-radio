// Simple CORS proxy server for local development
// Run with: node cors-proxy.js

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Get the target URL from query parameter
  const targetUrl = req.url.substring(1); // Remove leading slash
  
  if (!targetUrl) {
    res.writeHead(400);
    res.end('Missing target URL');
    return;
  }
  
  console.log(`Proxying request to: ${targetUrl}`);
  
  // Choose http or https based on target URL
  const client = targetUrl.startsWith('https') ? https : http;
  
  const proxyReq = client.request(targetUrl, (proxyRes) => {
    // Copy headers from target response
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.writeHead(proxyRes.statusCode);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500);
    res.end('Proxy error: ' + err.message);
  });
  
  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`CORS proxy server running on http://localhost:${PORT}`);
  console.log(`Usage: http://localhost:${PORT}/https://10.0.0.36/api/nowplaying/jtrap_radio`);
});
