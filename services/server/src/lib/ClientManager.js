const EventEmitter = require('events')

const EVENT_TYPES = {
  STREAM : {
    REQUEST : 'stream/request',
    READY : 'stream/ready'
  },
  IDENTITY : {
    PROVIDE : 'identity/provide',
    REQUEST : 'identity/request',
    RESPONSE : 'identity/response'
  },
  ANNOUNCE : 'announce'
}

/**
 * @typedef {import('ws')} WebSocket
 * @typedef {Map<string, WebSocket>} Room
 * @typedef {Map<string, Room} Rooms
 * @typedef {WebSocket & {room:Room, roomId:string, id:string}} Client
 */
module.exports = class ClientManager extends EventEmitter {
  constructor(options = {}){
    super()
    const { 
      roomLimit = -1,
      clientsPerRoomLimit = -1
    } = options 
    this.roomLimit = roomLimit
    this.clientsPerRoom = clientsPerRoomLimit
    /** @type {Rooms} */
    this.rooms = new Map()
    // bind functions
    this._onClientMessage = this._onClientMessage.bind(this)
  }

  package(event, data){}

  /**
   * Create a room if it doesn't already exist
   * @param {string} rid 
   * @returns {Room}
   */
  getRoom(rid){
    if(!this.rooms.has(rid)){
      this.rooms.set(rid, new Map())
    }
    return this.rooms.get(rid)
  }

  /**
   * Create a client in a specific room or the default room
   * @param {string} cid 
   * @param {Client} client
   * @param {string} rid 
   */
  connect(cid, client, rid='default'){
    console.log('[Websocket] client connected:', cid)
    const room = this.getRoom(rid)
    client.room = room
    client.roomId = rid
    client.id = cid
    // announce peer 
    const announceData = {
      type : EVENT_TYPES.ANNOUNCE,
      id : cid,
      cid // todo: deprecate
    }
    this.broadcast(room, announceData)
    // Add peer to room
    room.set(cid, client)
    // provide peer with its own id
    const idProvisionData = {
      type : EVENT_TYPES.IDENTITY.PROVIDE,
      room : rid,
      id : cid
    }
    this.message(client, idProvisionData)
    // Attach listeners
    this._addClientListeners(client)
  }

  /**
   * Handler for a client message event
   * Simply redirects the message to the 
   * target.
   * @param {Client} client
   * @param {import('ws').Data} msg 
   */
  _onClientMessage(client, msg){
    msg = JSON.parse(msg)
    const { target, ...data } = msg
    if(!target){
      return
    }
    const dataWithSender = {
      sender : client.id,
      ...data
    }
    this.message(client.room.get(target), dataWithSender)
  }

  /**
   * If a client gets disconnected
   * @param {Client} client
   * @param {number} code
   * @param {string} reason
   */
  _onClientClose(client, code, reason){
    console.log(`[Websocket] client Disconnected: ${client.id}. (${code}) - ${reason||'No Reason Given'}`)
    // remove peer from room
    client.room.delete(client.id)
  }

  /**
   * Add client listeners
   * @param {WebSocket} client 
   */
  _addClientListeners(client){
    client.on('message', (...data) => this._onClientMessage(client, ...data))
    client.on(  'close', (...data) => this._onClientClose(client,   ...data))
    client.on(  'error', (...data) => this._onClientError(client,   ...data))
  }

  /**
   * Format and send a message to a client
   * @param {Client} client 
   * @param {*} data 
   */
  message(client, data){
    const msg = JSON.stringify(data)
    client.send(msg)
  }
  /**
   * 
   * @param {Room|String} room 
   * @param {*} msg 
   */
  broadcast(room, msg){
    if(typeof room === 'string'){
      room = this.getRoom(room)
    }
    room.forEach(client => {
      this.message(client, msg)
    })
  }
}