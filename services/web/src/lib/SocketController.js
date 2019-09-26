import SimplePeer from 'simple-peer'
import EventEmitter from 'eventemitter3'

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

export default class WRTCSessionManager extends EventEmitter {
  constructor(options = {}){
    super()
    const { 
      server
    } = options
    this.id = null // set by signal server
    this.clientType = 'client'
    this.signalServer = server
    this.connection = null
    this.peers = new Map()
    this.init()
  }

  createPacket(event, data={}){
    return JSON.stringify({
      type : event,
      sender : this.id,
      ...data
    })
  }

  /**
   * This could use a lot of refactoring
   * @param {*} msg 
   * @param {*} initiator 
   */
  createPeer(msg, initiator=true) {
    const peer = new SimplePeer({ initiator })
    peer.cid = msg.cid
    this.peers.set(peer.cid, peer)
    peer.on('connect', () => {
      peer.send(this.createPacket(EVENT_TYPES.IDENTITY.REQUEST))
      // this.emit('peer.connect', peer.cid)
    })
    peer.on('error', err => {
      console.error(err)
      this.emit('peer.error', err)
    })
    peer.on('close', () => {
      console.log('Peer Disconnected', peer.cid)
      this.emit('peer.disconnect', peer.cid)
      this.peers.delete(peer.cid)
    })
    peer.on('data', (chunk)=>{
      const {type, ...data} = JSON.parse(chunk)
      console.log(type, data)
      if(!this[type])
        return 
      this[type](data, peer)
    })
    peer.on('signal', signal => {
      this.connection.send(JSON.stringify({
        type: 'signal',
        target: peer.cid,
        signal
      }))
    })
    peer.on('stream', stream => {

      // check the peer type to determine which event 
      // to use
      console.log(stream, peer)
      this.emit('browser.stream', stream, peer)
    })
    return this;
  }

  setIdentity(data){
    const { id } = data
    this.id = id
  }

  attachIdentity(data){
    console.log('Attach Identity', data)
  }

  processSignal(data) {
    if(!this.peers.has(data.cid)) {
      this.createPeer(data, false)
    }
    this.peers.get(data.cid).signal(data.signal)
  }

  _message(message, ...args){
    const data = JSON.parse(message.data)
    // console.log(data, ...args)
    const { type, ...rest } = data
    switch (type) {
      case EVENT_TYPES.IDENTITY.PROVIDE:
        this.setIdentity(rest)
        break
      case EVENT_TYPES.IDENTITY.RESPONSE:
        this.attachIdentity(rest)
        break
      case 'announce':
        this.createPeer(rest, true)
        break
      case 'signal':
        this.processSignal(rest)
        break
      default:
        break
        // this.emit(type, rest)
    }
  }

  [EVENT_TYPES.STREAM.READY](data, peer){
    peer.send(this.createPacket(EVENT_TYPES.STREAM.REQUEST))
  }

  init(){
    // console.log(this.signalServer)
    this.connection = new WebSocket(this.signalServer)
    // eslint-disable-next-line
    new Array('open', 'message', 'error').forEach(eventType => {
      if(!this[`_${eventType}`]) return
      this.connection.addEventListener(eventType, this[`_${eventType}`].bind(this))
    })
  }

  destroy(){
    return this
  }
}