const HTTPS_PORT = process.env.PORT || 443
const HTTP_PORT = 80

const expressWs = require('express-ws')
const fs = require('fs')
const uuid = require('uuid/v4')
const https = require('https')
const createError = require('http-errors')
const express = require('express')
const session = require('express-session')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const { db, docker } = require('./database-loader')
const apiRouter = require('./routes/api')

const app = express()
app.enable('trust proxy')
// http -> https redirect
app.use (function (req, res, next) {
  if (req.secure) {
    next()
  } else {
    res.redirect('https://' + req.headers.host + req.url)
  }
})
// WRTC Signal Server with SSL 
const server = https.createServer({
  key : fs.readFileSync('./localhost.key', 'utf-8'),
 cert : fs.readFileSync('./localhost.cert', 'utf-8')
}, app)
//
// Start the server.
//
;(async () => {
  await db.init()
  await docker.init()
  server.listen(HTTPS_PORT, () => {
    console.log(`Listening on https://localhost:${HTTPS_PORT}`);
  })
})()

expressWs(app, server)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', apiRouter);

const clients = new Map()

app.ws('/', function(client, req){
  // TODO: factor in user accounts?
  const id = uuid().split('-')[0]
  console.log('Client connected, assigning uuid:', id)
  clients.forEach(client => client.send(
    JSON.stringify({
      type : 'announce',
      cid : id
    })
  ))
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
})

// wss.broadcast = function(data, sender) {
//   this.clients.forEach(function(client) {
//     if(client === sender) return;
//     if(client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// }

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).json(err.status || 500);
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;
