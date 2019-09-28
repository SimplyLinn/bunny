import program from 'commander'
import dotenv from 'dotenv'

const dotEnvPath = path.resolve(process.env.TURTUS_ENV_PATH || __dirname+'/..'.repeat(4)+'/.env')
const config = dotenv.config({
  debug : process.env.TURTUS_DEBUG_ENV,
  path : dotEnvPath
})
for(let [key, value] of Object.entries(config.parsed)){
  value = process.env[key] || value
  try {
    config.parsed[key] = JSON.parse(value)
  } catch(e) {
    // pass
  }
}

program
  .option('-w, --width <number>', `Width of the browser window`, parseFloat)
  .option('-h, --height <number>', `Height of the browser window`, parseFloat)
  .option('-b, --bit-depth <number>', `Bit depth of the brwoser window`, parseFloat)
  .option('-s, --signal-server <url>', 'URL of signaling server')
  .option('-u, --open-url', 'The url to open in the browser')
  .parse(process.argv)

const args = program.opts()
for(let key in args){
  if(typeof args[key]==='undefined') delete args[key]
}

const defaults = {
  width: config.TURTUS_VB_DEFAULT_WIDTH || 1280,
  height: config.TURTUS_VB_DEFAULT_HEIGHT || 720,
  bitDepth: config.TURTUS_VB_DEFAULT_BIT_DEPTH || 24,
  timeout : config.TURTUS_VB_DEFAULT_IDLE_TIMEOUT || 6 * 1000 * 1000,
  signalServer: config.TURTUS_VB_DEFAULT_SIGNAL_SERVER,
  openUrl: config.TURTUS_VB_DEFAULT_URL
}

export default { ...defaults, ...args }