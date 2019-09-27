const rooms = new Map()
const clients = new Map()

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

/**
 * 
 * @param {*} client 
 * @param {Express.Request} req 
 */
module.exports = function(client, req){
  // TODO: factor in user accounts?
  const id = req.sessionID
  console.log('Client connected:', id)
  clients.forEach(client => client.send(
    JSON.stringify({
      type : 'announce',
      cid : id
    })
  ))
  // Notify client of its own id
  client.send(JSON.stringify({
    type : EVENT_TYPES.IDENTITY.PROVIDE,
    id
  }))

  clients.set(id, client)
  client.on('message', function(msg){
    msg = JSON.parse(msg)
    // console.log(id, msg)
    const { target, ...msgData } = msg
    if(!target){
      return
    }
    msgData.cid = id
    clients.get(target).send(JSON.stringify(msgData))
  })
  client.on('close', function(msg){
    console.log(`Client Disconnected: ${id}`)
    clients.delete(id)
  })
}