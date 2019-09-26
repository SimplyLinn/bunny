// TODO: Use Socket.io instead?
import WebSocket from 'ws'
import Peer from 'simple-peer'
import wrtc from 'wrtc'

/*function onOpen() {
  this.send({
    auth: {
      type: browserServer,
      secret: conf.secret,
      protocolVersion: 1
    }
  });
}*/

const EVENT_TYPES = {
  STREAM : {
    REQUEST : 'stream/request',
    READY : 'stream/ready'
  },
  IDENTITY : {
    PROVIDE : 'identity/provide',
    REQUEST : 'identity/request',
    RESPONSE : 'identity/response'
  }
}

export default class WrtcClient {
  constructor(config={}) {
    const { 
      signalServer,
      virtualBrowser = null
    } = config
    this.id = null // set by signaling server
    this.virtualBrowser = virtualBrowser
    this.signalServer = signalServer
    this.clientType = 'vb'
    this.peers = new Map()
  }

  createPacket(event, data={}){
    return JSON.stringify({
      type : event,
      sender : this.id,
      ...data
    })
  }

  setVirtualBrowser(browser){
    this.virtualBrowser = browser
    this.broadcast(this.createPacket(EVENT_TYPES.STREAM.READY))
  }
  /**
   * Initialize the WRTC Connection and stuff
   */
  init(){
    return new Promise((res, rej)=>{
      try {
        this.ws = new WebSocket(this.signalServer, {
          perMessageDeflate: false,
          rejectUnauthorized: false
        })
        // wait until the virtual browser is set 
        this.ws.on('message', (msg) => {
          const { type, ...data } = JSON.parse(msg)
          if(type === EVENT_TYPES.IDENTITY.PROVIDE){
            this.id = data.id
            return res()
          }
          // console.log(`I: [${data.cid}] ${type}`)
          if(!this[type]) 
            return
          this[type](data)
        })
        .on('close', (code, reason) => {
          console.error(`😞 Websocket Closed: Code ${code}`, reason)
          if(code !== 0){
            rej('Socket Closed Unexpectedly')
          }
          setImmediate(()=>process.exit())
        })
        .on('error', (err) => {
          console.error(err)
          rej(err)
        })
      }catch(e){
        rej(e)
      }
    })
  }

  announce(msg, initiator=true) {
    const peer = new Peer({ 
      wrtc, 
      initiator,
    })
    peer.cid = msg.cid;
    this.peers.set(peer.cid, peer)
    peer.on('connect', () => {
      console.log(`🤔 [${msg.cid}] Connected`)
      // let the particular peer know the stream is ready to be requested
      if(this.virtualBrowser){
        peer.send(this.createPacket(EVENT_TYPES.STREAM.READY))
      }
    })
    .on('data', (data) => this.onData(data))
    .on('error', (err) => {
      console.log(`👎 [${peer.cid}]`, err)
    })
    .on('close', () => {
      console.log(`🤔 [${peer.cid}] Disconnected`)
      this.peers.delete(peer.cid)
    })
    .on('signal', signal => {
      this.ws.send(JSON.stringify({
        type: 'signal',
        target: msg.cid,
        signal
      }))
    })
    // new InstructionReader(peer, this)
    return peer;
  }

  onData(msg) {
    // invalid data shouldn't crash the whole system or disconnect the peer lol
    try{
      const { type, ...rest } = JSON.parse(msg)
      if(this[type])
        return this[type](rest)
      return this.virtualBrowser[type](...(rest.args || []))
    }catch(e){
      console.error(`Invalid Data: ${msg}`)
      console.error(e) 
    }
  }

  [EVENT_TYPES.IDENTITY.REQUEST](msg){
    const { sender } = msg
    const peer = this.peers.get(sender)
    peer.send(this.createPacket(EVENT_TYPES.IDENTITY.RESPONSE), { clientType : this.clientType })
  }

  /**
   * Attaches a stream to a peer when requested
   * @param {*} msg 
   */
  [EVENT_TYPES.STREAM.REQUEST](msg){
    const { sender } = msg
    const peer = this.peers.get(sender)
    peer.addStream(this.virtualBrowser.getStream())
  }

  signal(msg) {
    let peer = this.peers.get(msg.cid)
    // TODO: create if not defined?
    if(!peer){
      return
    }
    peer.signal(msg.signal)
  }
  
  /**
   * Send a message to all connected peers
   * @param {*} msg 
   */
  broadcast(msg){
    for(let [, peer] of this.peers){
      peer.send(msg)
    }
  }
}