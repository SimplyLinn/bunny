const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const bcrypt = require('bcrypt')
const uuid = require('uuid')

const { db, docker } = require('../database-loader')

const requireArgs = (body=[], query=[]) => (req, res, next) => {
  if(body.some(a=>!Boolean(req.body[a]))) 
    return next(createError(400,  `Expected [${body.join(", ")}] in body`))
  if(query.some(a=>!Boolean(req.query[a]))) 
    return next(createError(400,  `Expected [${query.join(", ")}] in query`))
  return next()
}

router.get('/', (req, res, next) => {
  res.json(new Date())
})

// TODO: lock creation behind some kind of access token
router.route('/virtual_browser/start')
  .get(async (req, res, next)=>{
    try {
      // TODO: store container id in db and return different id (for security)
      const id = await docker.start()
      res.json({ message:'👍 Browser Created', id })
    } catch (e) {
      // TODO: custom error types
      next(createError(500, '👎 Browser Failed to start'))
    }
  })
router.route('/virtual_browser/stop')
  .get(requireArgs([], ['cid']), 
  async (req, res, next) => {
    const { cid } = req.query
    try {
      await docker.stop(cid)
      res.json({message:'💥 Browser Destroyed'})
    }catch(e){
      next(createError(500, '👎 Browser failed to stop or is already stopped'))
    }
  })

router.route('/user')
  .post(
    requireArgs(['username', 'email', 'password']), 
    async (req, res, next) => {
      const { 
        username,
        email,
        password,
        ...extras
      } = req.body
      // TODO: Check if user exists
      // Generate a uuuid
      const id = uuid().replace(/-/g,'').slice(0,16)
      // Hash the password
      const saltRounds = 10
      const encryptedPass = await bcrypt.hash(password, saltRounds)
      const userData = { username, email, password: encryptedPass, ...extras }
      await db.set(db.createPathObject(`/users/${id}`), userData)
      // create a user in the database
      res.json({ message : 'User Created Successfully', id })
  })

router.route('/user/:uid')
  // get user by id
  .get(async (req, res, next) => {
    console.log(req.params)
    const id = req.params.uid
    await db.get(db.createPathObject(`/users/${id}`))
    // get user from database
    res.json({})
  })
  // update user by id
  .put(async (req, res, next) => {

  })
  // delete user by id
  .delete(async (req, res, next) => {

  })

/**
 * 
 */
router
  .route('/room')
  .post(
    requireArgs(['roomName','ownerId']),
    async (req, res, next) => {
      const { 
        roomName,
        private = false,
        title = 'Untitled Room',
        ownerId 
      } = req.body  
      const ownerDoesExist = await db.exists(db.createPathObject(`users/${ownerId}`))
      if(!ownerDoesExist){
        return next(createError(404, 'Owner does not exist'))
      }    
      const roomDoesExist = await db.find(db.createPathObject('rooms'), { roomName })
      if(roomDoesExist){
        return next(createError(409, 'Room name already taken'))
      }
      
      const id = uuid()
      const roomData = {
        private,
        title,
        roomName,
        owner : ownerId,
      }
      await db.set(db.createPathObject(`/rooms/${id}`), roomData)
      res.json({ message : 'Room Created Successfully', id, roomName })
    }
  )
router
  .route('/room/:roomName')
  .get(async (req, res, next)=>{
    const { roomName } = req.params
    const room = await db.find(db.createPathObject('rooms'), {roomName})
    res.json(room || null)
  })
  //.ws(async(ws, req, res) => {
  //   // Spin up an instance of docker container
  //   // TODO: If all peers disconnect, stop the container
  // })

router.use(function(err, req, res, next){
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  return res.status(status).json({ status, message })
})

module.exports = router;
