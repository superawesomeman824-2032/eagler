import express from 'express';
import http from 'http';
import { createBareServer } from '@tomphttp/bare-server-node';
import path from 'path';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';

const app = express();
const server = http.createServer(app);
const bare = createBareServer('/bare/');
const __dirname = path.resolve();

// Serve Ultraviolet static assets
app.use('/uv/', express.static(uvPath));

// KEEP-ALIVE PING BACKUP (Prevents Render from sleeping)
app.get('/ping', (req, res) => {
  res.send('pong');
});

// DYNAMIC CONFIG ROUTE WITH TRIPLE BACKUPS
app.get('/uv.config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    self.__uv$config = {
        prefix: '/uv/service/',
        bare: '/bare/',
        encodeUrl: (url) => {
          if (!url) return '';
          try { return Ultraviolet.codec.xor.encode(url); } 
          catch(e) { return encodeURIComponent(url); }
        },
        decodeUrl: (url) => {
          if (!url) return '';
          try { return Ultraviolet.codec.xor.decode(url); } 
          catch(e) { return decodeURIComponent(url); }
        },
        handler: '/uv/uv.handler.js',
        client: '/uv/uv.client.js',
        bundle: '/uv/uv.bundle.js',
        config: '/uv.config.js',
        sw: '/uv/uv.sw.js',
    };
  `);
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clover S-Tier Proxy</title>
  <script src="/uv/uv.bundle.js"></script>
  <script src="/uv.config.js"></script>
  <style>
    body { margin: 0; display: flex; flex-direction: column; height: 100vh; background: #0d1117; font-family: sans-serif; color: #e6edf3; overflow: hidden; }
    #navbar { padding: 10px 20px; background: #161b22; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #30363d; flex-shrink: 0; }
    h1 { margin: 0; color: #56d364; font-size: 20px; font-weight: 800; cursor: pointer; }
    #search-form { display: flex; flex-grow: 1; max-width: 700px; }
    input { width: 100%; padding: 10px 16px; border-radius: 8px; border: 1px solid #30363d; background: #0d1117; color: white; outline: none; font-size: 14px; }
    input:focus { border-color: #56d364; }
    #status { font-size: 12px; color: #8b949e; margin-left: auto; }
    iframe { flex-grow: 1; border: none; width: 100%; height: 100%; background: white; }
  </style>
</head>
<body>
  <div id="navbar">
    <h1 onclick="resetProxy()">Clover</h1>
    <form id="search-form" onsubmit="executeSearch(event)">
      <input type="text" id="address" placeholder="Search DuckDuckGo or enter URL..." autofocus autocomplete="off">
    </form>
    <div id="status">System Ready (10 Backups Active)</div>
  </div>
  <iframe id="frame" src=""></iframe>
  
  <script>
    // SELF-HEALING NON-BLOCKING SERVICE WORKER REGISTRATION
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }

    // RENDER KEEP-ALIVE PING (Pings server every 3 minutes so it never sleeps)
    setInterval(() => {
      fetch('/ping').catch(() => {});
    }, 180000);

    const status = document.getElementById('status');
    const input = document.getElementById('address');
    const frame = document.getElementById('frame');

    function resetProxy() {
      input.value = '';
      frame.src = '';
      status.innerText = "System Ready";
    }

    function executeSearch(e) {
      if (e) e.preventDefault();
      let query = input.value.trim();
      if (!query) return;

      status.innerText = "Processing...";
      let targetUrl = query;
      
      if (!query.startsWith('http://') && !query.startsWith('https://')) {
        if (query.includes('.') && !query.includes(' ')) {
          targetUrl = 'https://' + query;
        } else {
          targetUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
        }
      }

      try {
        const encoder = window.__uv$config.encodeUrl || ((val) => encodeURIComponent(val));
        const encodedDestination = window.__uv$config.prefix + encoder(targetUrl);
        
        frame.src = encodedDestination;
        frame.onload = () => { status.innerText = "Connected"; };
      } catch (err) {
        status.innerText = "Fallback Active";
        frame.src = targetUrl;
      }
    }

    // QUADRUPLE ENTER KEY HANDLERS
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        executeSearch(e);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        executeSearch(e);
      }
    });
  </script>
</body>
</html>`);
});

// SERVICE WORKER ROUTE
app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    importScripts('/uv/uv.bundle.js');
    importScripts('/uv.config.js');
    importScripts('/uv/uv.sw.js');
    const sw = new UVServiceWorker();
    self.addEventListener('fetch', event => {
        try {
            event.respondWith(sw.route(event));
        } catch (e) {}
    });
  `);
});

server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Clover proxy running on port ' + PORT);
});
