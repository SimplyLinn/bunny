const HTTPS_PORT = 443
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

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

const app = express()
// WRTC Signal Server with SSL 
const server = https.createServer({
  key : fs.readFileSync('./key.pem', 'utf-8'),
 cert : fs.readFileSync('./cert.pem', 'utf-8')
}, app)
//
// Start the server.
//
server.listen(HTTPS_PORT, () => {
  console.log(`Listening on https://localhost:${HTTPS_PORT}`);
})

const wsInstance = expressWs(app, server)
const wss = wsInstance.getWss()

// const sessionParser = session({
//   saveUninitialized: false,
//   secret: '$eCuRiTy',
//   resave: false
// })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const clients = new Map()

app.ws('/', function(client, req){
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

// const wss = new Websocket.Server({
//   noServer : true
// })

// server.on('upgrade', function(request, socket, head) {
//   console.log('Parsing session from request...')
//   // wss.handleUpgrade(request, socket, head,)
//   // sessionParser(request, {}, () => {
//   //   if (!request.session.userId) {
//   //     socket.destroy()
//   //     return
//   //   }

//   //   console.log('Session is parsed!')

//   // })
//       wss.handleUpgrade(request, socket, head, function(ws) {
//         wss.emit('connection', ws, request);
//       })
// })

// wss.on('connection', (client, request) => {
//   const id = uuid()
//   console.log('Client connected, assigning uuid:', id)

//   clients.forEach(client => client.send(JSON.stringify({
//     type : 'announce',
//     cid : id
//   })))

//   clients.set(id, client)

//   client.on('message', (message) => {
//     message = JSON.parse(message)
//     console.log(id, message)
//     const target = message.target
//     // console.log(`Received message ${message} from user ${id}`)
//   })

//   client.on('close', ()=>{
//     console.log(`Closing connection to ${id}`)
//     clients.delete(id)
//   })
// })

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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;
