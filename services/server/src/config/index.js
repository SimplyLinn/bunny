const dotenv = require('dotenv')
const path = require('path')
// get dotenv location
const dotEnvPath = path.resolve(process.env.TURTUS_ENV_PATH || __dirname+'/..'.repeat(4)+'/.env')
const config = dotenv.config({
  debug : process.env.TURTUS_DEBUG_ENV,
  path : dotEnvPath
})
// convert things that look like num
for(let [key, value] of Object.entries(config.parsed)){
  try {
    config.parsed[key] = JSON.parse(value)
  } catch(e) {
    // pass
  }
}

module.exports = config.parsed