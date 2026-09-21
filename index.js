import express from 'express';
import http from 'http';
import { createBareServer } from '@tomphttp/bare-server-node';
import path from 'path';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';

const app = express();
const server = http.createServer(app);
const bare = createBareServer('/bare/');
const __dirname = path.resolve();

// 1. Static Asset Backup Middleware
app.use('/uv/', express.static(uvPath));

// 2. Primary Interface with Quadruple Fallbacks & Instant Enter Key Binding
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clover S-Tier Proxy</title>
  <script src="/uv/uv.bundle.js"></script>
  <style>
    :root {
      --bg-main: #0d1117;
      --bg-nav: #161b22;
      --border-color: #30363d;
      --accent: #56d364;
      --text-main: #e6edf3;
      --text-muted: #8b949e;
    }
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      display: flex; 
      flex-direction: column; 
      height: 100vh; 
      background: var(--bg-main); 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
      color: var(--text-main); 
      overflow: hidden; 
    }
    #navbar { 
      padding: 10px 20px; 
      background: var(--bg-nav); 
      display: flex; 
      align-items: center; 
      gap: 15px; 
      border-bottom: 1px solid var(--border-color); 
      flex-shrink: 0; 
    }
    h1 { 
      margin: 0; 
      color: var(--accent); 
      font-size: 20px; 
      font-weight: 800; 
      cursor: pointer; 
      letter-spacing: 0.5px;
    }
    #search-form { 
      display: flex; 
      flex-grow: 1; 
      max-width: 700px; 
    }
    input { 
      width: 100%; 
      padding: 10px 16px; 
      border-radius: 8px; 
      border: 1px solid var(--border-color); 
      background: var(--bg-main); 
      color: var(--text-main); 
      outline: none; 
      font-size: 14px; 
      transition: border-color 0.2s;
    }
    input:focus { 
      border-color: var(--accent); 
    }
    #status { 
      font-size: 12px; 
      color: var(--text-muted); 
      margin-left: auto; 
      background: rgba(255,255,255,0.03);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }
    #frame-container {
      flex-grow: 1;
      display: flex;
      background: #ffffff;
      width: 100%;
      height: 100%;
    }
    iframe { 
      border: none; 
      width: 100%; 
      height: 100%; 
      background: white; 
    }
  </style>
</head>
<body>
  <div id="navbar">
    <h1 onclick="resetProxy()">Clover</h1>
    <form id="search-form" onsubmit="executeProxySearch(event)">
      <input type="text" id="address" placeholder="Search DuckDuckGo or enter URL (e.g. google.com)..." autofocus autocomplete="off">
    </form>
    <div id="status">System Ready</div>
  </div>
  <div id="frame-container">
    <iframe id="frame" src=""></iframe>
  </div>
  
  <script>
    // BACKUP 1: Hardcoded Client-Side Ultraviolet Fallback Configuration
    window.__uv$config = {
        prefix: '/uv/service/',
        bare: '/bare/',
        encodeUrl: Ultraviolet.codec.xor.encode,
        decodeUrl: Ultraviolet.codec.xor.decode,
        handler: '/uv/uv.handler.js',
        client: '/uv/uv.client.js',
        bundle: '/uv/uv.bundle.js',
        config: '/uv.config.js',
        sw: '/uv/uv.sw.js',
    };

    // BACKUP 2: Autonomous Non-Blocking Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(() => console.log('[Clover] Service Worker Registered Successfully'))
        .catch(err => console.warn('[Clover] Service Worker Warning:', err));
    }

    const input = document.getElementById('address');
    const frame = document.getElementById('frame');
    const status = document.getElementById('status');

    function resetProxy() {
      input.value = '';
      frame.src = '';
      status.innerText = 'System Ready';
      input.focus();
    }

    function executeProxySearch(e) {
      if (e) e.preventDefault();
      let query = input.value.trim();
      if (!query) return;

      status.innerText = "Routing...";
      let targetUrl = query;
      
      // BACKUP 3: Intelligent Query Type Handler (DuckDuckGo HTML Search Engine vs Direct URL)
      if (!query.startsWith('http://') && !query.startsWith('https://')) {
        if (query.includes('.') && !query.includes(' ') && !query.includes('?')) {
          targetUrl = 'https://' + query;
        } else {
          // Uses DuckDuckGo HTML frontend to guarantee smooth iframe embedding without breaking restrictions
          targetUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
        }
      }

      // BACKUP 4: Try-Catch Safe Frame Injection Execution
      try {
        const encodedDestination = __uv$config.prefix + __uv$config.encodeUrl(targetUrl);
        frame.src = encodedDestination;
        
        frame.onload = () => {
          status.innerText = "Active";
        };
      } catch (err) {
        status.innerText = "Execution Error";
        console.error("[Clover Proxy Fatal Error]:", err);
      }
    }

    // BACKUP 5: Dual Layer Enter Key Interceptor (Keydown + Keypress redundancy)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        executeProxySearch(e);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        executeProxySearch(e);
      }
    });
  </script>
</body>
</html>`);
});

// 3. Dynamic Service Worker Backup Route
app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    importScripts('/uv/uv.bundle.js');
    importScripts('/uv/uv.sw.js');
    const sw = new UVServiceWorker();
    self.addEventListener('fetch', event => {
        try {
            event.respondWith(sw.route(event));
        } catch (err) {
            console.error('[SW Fetch Error]:', err);
        }
    });
  `);
});

// 4. Dual Protocol Server Request Routing Backup
server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Clover S-Tier Bulletproof Proxy active on port ' + PORT);
});
