var Peer = require('simple-peer')
var wrtc = require('wrtc');
const createTrack = require('./video');

const HTTPS_PORT = 8443;

const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
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
  } else {
    response.writeHead(404).end();
  }
};

const httpsServer = https.createServer(serverConfig, handleRequest);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
const wss = new WebSocketServer({server: httpsServer});

const peers = [];

const { stream } = createTrack();
wss.on('connection', function(ws) {
  const peer = new Peer({ wrtc: wrtc, initiator: true });
  peers.push(peer);
  peer.on('signal', message => {
    const data = JSON.stringify(message);
    console.log('INTERNAL-SIGNAL', message);
    ws.send(data);
  });
  peer.on('connect', () => {
    peer.addStream(stream)
  });
  ws.on('message', function(message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message);
    peer.signal(JSON.parse(message));
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


console.log('Server running. Visit https://localhost:' + HTTPS_PORT + ' in Firefox/Chrome.\n\n\
Some important notes:\n\
  * Note the HTTPS; there is no HTTP -> HTTPS redirect.\n\
  * You\'ll also need to accept the invalid TLS certificate.\n\
  * Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.\n'
);