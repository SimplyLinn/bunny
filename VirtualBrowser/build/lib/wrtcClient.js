"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ws = _interopRequireDefault(require("ws"));

var _simplePeer = _interopRequireDefault(require("simple-peer"));

var _wrtc = _interopRequireDefault(require("wrtc"));

var _instructionReader = _interopRequireDefault(require("./instructionReader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*function onOpen() {
  this.send({
    auth: {
      type: browserServer,
      secret: conf.secret,
      protocolVersion: 1
    }
  });
}*/
function onMessage(msg) {
  const message = JSON.parse(msg);

  switch (message.type) {
    case 'announce':
      this.newClient(message, true);
      break;

    case 'signal':
      this.signal(message);
  }
}

function onData(msg) {
  msg = JSON.parse(msg);
  console.log(msg);
  this.virtualBrowser.input[msg.input](...(msg.args || []));
}

class WrtcClient {
  constructor({
    signalServer,
    virtualBrowser
  } = {}) {
    this.virtualBrowser = virtualBrowser;
    this.peers = new Map();
    this.ws = new _ws.default(signalServer, {
      perMessageDeflate: false,
      rejectUnauthorized: false
    }); //this.ws.on('open', onOpen.bind(this));

    this.ws.on('message', onMessage.bind(this));
  }

  newClient(msg, initiator) {
    console.log(msg, initiator);
    const peer = new _simplePeer.default({
      wrtc: _wrtc.default,
      initiator
    });
    peer.addStream(this.virtualBrowser.getStream(peer));
    peer.cid = msg.cid;
    this.peers.set(peer.cid, peer);
    peer.on('error', err => {
      console.log('PEER ERROR', err);
    });
    peer.on('close', () => this.peers.delete(peer.cid));
    peer.on('signal', signal => {
      this.send({
        type: 'signal',
        target: msg.cid,
        signal
      });
    }); //peer.on('data', onData.bind(this));

    new _instructionReader.default(peer, this);
    return peer;
  }

  signal(msg) {
    let peer = this.peers.get(msg.cid);

    if (!peer) {
      peer = this.newClient(msg, false);
    }

    peer.signal(msg.signal);
  }

  send(obj) {
    this.ws.send(JSON.stringify(obj));
  }

}

exports.default = WrtcClient;