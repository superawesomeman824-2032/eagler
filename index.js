import express from 'express';
import http from 'http';
import { createBareServer } from '@tomphttp/bare-server-node';
import path from 'path';

const app = express();
const server = http.createServer(app);
const bare = createBareServer('/bare/');
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'public')));

server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Clover running on port ${PORT}`);
});
