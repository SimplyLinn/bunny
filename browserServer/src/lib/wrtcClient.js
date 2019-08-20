
const WebSocket = require('ws');
const Peer = require('simple-peer');
const wrtc = require('wrtc');

function onOpen() {
  this.send({
    auth: {
      type: browserServer,
      secret: conf.secret,
      protocolVersion: 1
    }
  });
}

function onMessage(msg) {
  const message = JSON.parse(msg);
  switch(message.type) {
    case 'announce':
      this.newClient(message, true);
      break;
    case 'signal':
      this.signal(message);
  }
}

function onData(msg) {
  msg = JSON.parse(msg);
  console.log(msg)
  this.virtualBrowser.input[msg.input](...(msg.args||[]));
}

class WrtcClient {
  constructor(signalServer, virtualBrowser) {
    this.virtualBrowser = virtualBrowser;
    this.peers = new Map;
    this.ws = new WebSocket(signalServer, {
      perMessageDeflate: false,
      rejectUnauthorized: false
    });
    //ws.on('open', onOpen.bind(this));
    this.ws.on('message', onMessage.bind(this));
  }

  newClient(msg, initiator) {
    console.log(msg, initiator);
    const peer = new Peer({ wrtc: wrtc, initiator, stream: this.virtualBrowser.mediaStream });
    peer.cid = msg.cid;
    this.peers.set(peer.cid, peer);
    peer.on('error', (err) => {
      console.log('PEER ERROR', err);
    });
    peer.on('close', () => this.peers.delete(peer.cid));
    peer.on('signal', signal => {
      this.send({
        type: 'signal',
        target: msg.cid,
        signal
      });
    });
    peer.on('data', onData.bind(this));
    return peer;
  }

  signal(msg) {
    let peer = this.peers.get(msg.cid);
    if(!peer) {
      peer = this.newClient(msg, false);
    }
    peer.signal(msg.signal);
  }

  send(obj) {
    this.ws.send(JSON.stringify(obj));
  }
}

module.exports = WrtcClient;