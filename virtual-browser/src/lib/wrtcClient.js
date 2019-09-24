// TODO: Use Socket.io instead?
import WebSocket from 'ws'
import Peer from 'simple-peer'
import wrtc from 'wrtc'
import InstructionReader from './instructionReader'

/*function onOpen() {
  this.send({
    auth: {
      type: browserServer,
      secret: conf.secret,
      protocolVersion: 1
    }
  });
}*/

export default class WrtcClient {
  constructor(config={}) {
    const { 
      signalServer,
      virtualBrowser
    } = config

    this.virtualBrowser = virtualBrowser
    this.signalServer = signalServer
    this.peers = new Map()
  }

  init(){
    try{
      this.ws = new WebSocket(this.signalServer, {
        perMessageDeflate: false,
        rejectUnauthorized: false
      })
      
      this.ws.on('message', this.onMessage.bind(this))
      .on('close', () => {
        console.log('websocket closed')
        // close connection
        process.exit(0)
      })
      .on('open', () => {
        console.log('websocket opened')
      })
    }catch(e){
      console.warn(e)
      process.exit()
    }
    //this.ws.on('open', onOpen.bind(this));
  }

  onMessage(msg) {
    const {type, ...data} = JSON.parse(msg)
    console.log(`I: [${data.cid}] ${type}`)
    if(!this[type]) return
    this[type](data)
  }

  announce(msg, initiator=true) {
    console.log(`I: [${msg.cid}] connecting`)
    const peer = new Peer({ 
      wrtc, 
      initiator,
    })
    peer.addStream(this.virtualBrowser.getStream(peer))
    peer.cid = msg.cid;
    
    this.peers.set(peer.cid, peer)

    peer.on('error', (err) => {
      console.log(`E: [${peer.cid}]`, err)
    })
    .on('close', () => {
      console.log(`I: [${peer.cid}] Disconnected`)
      this.peers.delete(peer.cid)
    })
    .on('signal', signal => {
      this.send({
        type: 'signal',
        target: msg.cid,
        signal
      })
    })
    peer.on('data', this.onData.bind(this));
    new InstructionReader(peer, this)

    return peer;
  }

  onData(msg) {
    msg = JSON.parse(msg);
    this.virtualBrowser[msg.input](...(msg.args||[]));
  }

  signal(msg) {
    console.log(`Signal ${msg}`)
    let peer = this.peers.get(msg.cid);
    peer.signal(msg.signal);
  }

  send(obj) {
    this.ws.send(JSON.stringify(obj));
  }
}