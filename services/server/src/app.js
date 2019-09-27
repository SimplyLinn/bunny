const config = require('./config')

const expressWs = require('express-ws')
const cors = require('cors')
const fs = require('fs')
const https = require('https')
const createError = require('http-errors')
const express = require('express')
const session = require('express-session')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const { db, docker } = require('./database-loader')
const apiRouter = require('./routes/api')
const wsRouter = require('./routes/ws')

const PORT = process.env.PORT || config.TURTUS_SERVER_PORT || 443

const app = express()
app.enable('trust proxy')
const sessionParser = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store : db.getSessionStore(),
  cookie: { secure: 'auto' }
})
app.use(sessionParser)
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
  key : fs.readFileSync(`${__dirname}/config/localhost.key`, 'utf-8'),
 cert : fs.readFileSync(`${__dirname}/config/localhost.cert`, 'utf-8')
}, app)

// Start the server.
//
;(async () => {
  await db.init()
  await docker.init({
    signalServer : config.TURTUS_VB_DEFAULT_SIGNAL_SERVER
  })
  server.listen(PORT, () => {
    console.log(`Listening on https://localhost:${PORT}`);
  })
})()

const ws = expressWs(app, server)

app.use(cors({
  origin : [/^((https?:)?\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/],
  credentials : true
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('keyboard cat'));
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.use('/', apiRouter)
app.ws('/', wsRouter)

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  console.error(err)
  res.status(err.status || 500).json(err.status || 500);
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;
