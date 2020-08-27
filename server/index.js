const Controller = require('./controller');
const http = require('http');
const server = http.createServer();

const controller = new Controller();

server.on('request', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  if (req.method === 'OPTIONS') {
    res.status = 200;
    res.end();
    return;
  }

  if (req.url.indexOf('/fileChunk/presence') !== -1) {
    await controller.handleVerifyUpload(req, res);
    return;
  }

  if (req.url === '/fileChunk/merge') {
    await controller.handleMerge(req, res);
    return;
  }

  if (req.url === '/fileChunk') {
    await controller.handleFileChunk(req, res);
  }
  if (req.url === '/') {
    res.end('Welcome');
  }
});

server.listen(3000, '0.0.0.0', () => console.log('正在监听 3000 端口'));
