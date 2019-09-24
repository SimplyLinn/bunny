import SimplePeer from 'simple-peer'
import EventEmitter from 'eventemitter3'

export default class WRTCSessionManager extends EventEmitter {
  constructor(options = {}){
    super()
    const { 
      server
    } = options

    this.signalServer = server
    this.connection = null
    this.peers = new Map()
    this.init()
  }

  createPeer(msg, initiator=true) {
    const peer = new SimplePeer({ initiator })
    peer.cid = msg.cid
    console.log(`Peer Connected! ${peer.cid}`)
    this.peers.set(peer.cid, peer)
    peer.on('error', err => {
      this.emit('peer.error', err)
    })
    peer.on('close', () => {
      this.emit('peer.close', peer.cid)
      this.peers.delete(peer.cid)
    })
    peer.on('message', m => {
      console.log(m)
    })
    peer.on('signal', signal => {
      this.emit('peer.signal', signal)
      this.send({
        type: 'signal',
        target: peer.cid,
        signal
      });
    });
    peer.on('stream', stream => {
      this.emit('peer.stream', stream)
    })
    return this;
  }

  processSignal(data) {
    if(!this.peers.has(data.cid)) {
      this.createPeer(data, false)
    }
    this.peers.get(data.cid).signal(data.signal)
  }

  _message(message){
    const data = JSON.parse(message.data)
    const { type, ...rest } = data
    switch (type) {
      case 'announce':
        this.createPeer(rest, true);
        break;
      case 'signal':
        this.processSignal(rest)
      default:
        this.emit(type, rest)
    }
  }

  send(obj){
    console.log('WS-OUT', obj);
    this.connection.send(JSON.stringify(obj));
  }

  init(){
    console.log(this.signalServer)
    this.connection = new WebSocket(this.signalServer)
    // eslint-disable-next-line
    new Array('open', 'message', 'error').forEach(eventType => {
      if(!this[`_${eventType}`]) return
      this.connection.addEventListener(eventType, this[`_${eventType}`].bind(this))
    })
    console.log(this.connection)
  }

  destroy(){
    return this
  }
}