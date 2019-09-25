const isProd = /^prod/i.test(process.env.NODE_ENV)

console.log('Starting in', isProd ? 'production' : 'development', 'mode')

const LocalDatabaseDriver = require('./lib/LocalDatabaseDriver')
const LocalDockerDriver = require('./lib/LocalDockerDriver')

// TODO: Check configs and determine best driver for the program
module.exports = {
  docker : new LocalDockerDriver(),
  db : new LocalDatabaseDriver()
}