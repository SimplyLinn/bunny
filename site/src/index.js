const HTTPS_PORT = 8443;

const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const uuidv4 = require('uuid/v4');

const WebSocketServer = WebSocket.Server;

// Yes, TLS is required
const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// ----------------------------------------------------------------------------------------

// Create a server for the client html page
const handleRequest = function(request, response) {
  // Render the single client html file for any request the HTTP server receives
  console.log('request received: ' + request.url);

  if(request.url === '/') {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('client/index.html'));
  } else if(request.url === '/simplepeer.min.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/simplepeer.min.js'));
  } else if(request.url === '/opCodes.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/opCodes.js'));
  } else if(request.url === '/keyboard.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/keyboard.js'));
  } else {
    response.writeHead(404);
    response.end();
  }
};

const httpServer = http.createServer(serverConfig, handleRequest);
httpServer.listen(HTTPS_PORT, '0.0.0.0');

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
const wss = new WebSocketServer({server: httpServer});

const clients = new Map();

wss.on('connection', function(ws) {
  const uuid = uuidv4();
  console.log('Client connected, assigning uuid:', uuid);
  clients.forEach(client=>client.send(JSON.stringify({
    type: 'announce',
    cid: uuid
  })));
  clients.set(uuid, ws);
  ws.on('message', function(message) {
    const msg = JSON.parse(message);
    const target = msg.target;
    delete msg.target;
    msg.cid = uuid;
    clients.get(target).send(JSON.stringify(msg));
  });
  ws.on('close', function() {
    console.log('Closing connection to', uuid);
    clients.delete(uuid);
  });
});

wss.broadcast = function(data, sender) {
  this.clients.forEach(function(client) {
    if(client === sender) return;
    if(client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};


console.log('Server running. Visit http://localhost:' + HTTPS_PORT + ' in Firefox/Chrome.\n\n\
Some important notes:\n\
  * Note the HTTPS; there is no HTTP -> HTTPS redirect.\n\
  * You\'ll also need to accept the invalid TLS certificate.\n\
  * Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.\n'
);