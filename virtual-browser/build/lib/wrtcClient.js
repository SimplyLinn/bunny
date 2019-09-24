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

// TODO: Use Socket.io instead?

/*function onOpen() {
  this.send({
    auth: {
      type: browserServer,
      secret: conf.secret,
      protocolVersion: 1
    }
  });
}*/
class WrtcClient {
  constructor(config = {}) {
    const {
      signalServer,
      virtualBrowser
    } = config;
    this.virtualBrowser = virtualBrowser;
    this.signalServer = signalServer;
    this.peers = new Map();
  }

  init() {
    try {
      this.ws = new _ws.default(this.signalServer, {
        perMessageDeflate: false,
        rejectUnauthorized: false
      });
      this.ws.on('message', this.onMessage);
    } catch (e) {
      console.warn(e);
    } //this.ws.on('open', onOpen.bind(this));

  }

  onMessage(msg) {
    const message = JSON.parse(msg);
    console.log('Message Received');
    if (!this[message.type]) return;
    this[message.type](message);
  }

  announce(msg, initiator = true) {
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
    }).on('close', () => this.peers.delete(peer.cid)).on('signal', signal => {
      this.send({
        type: 'signal',
        target: msg.cid,
        signal
      });
    });
    peer.on('data', onData);
    new _instructionReader.default(peer, this);
    return peer;
  }

  onData(msg) {
    msg = JSON.parse(msg);
    console.log(msg);
    this.virtualBrowser[msg.input](...(msg.args || []));
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