const EventEmitter = require('events')

module.exports = class ClientManager extends EventEmitter {
  constructor(options = {}){
    const { 
      roomLimit = -1,
      clientsPerRoomLimit = -1
    } = options 
    this.roomLimit = roomLimit
    this.clientsPerRoom = clientsPerRoomLimit
    this.rooms = new Set()
    this.clients = new Map()
  }

}