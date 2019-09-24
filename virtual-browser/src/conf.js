import program from 'commander'

program
  .option('-w, --width <number>', `Width of the browser window`, parseFloat)
  .option('-h, --height <number>', `Height of the browser window`, parseFloat)
  .option('-b, --bit-depth <number>', `Bit depth of the brwoser window`, parseFloat)
  .option('-s, --signal-server <url>', 'URL of signaling server')
  // .option('--firefox-args <items>', 'Arguments to be passed to firefox instance', v=>v.split(' '))
  .option('--secret', '???')
  .parse(process.argv)

const args = program.opts()
for(let key in args){
  if(typeof args[key]==='undefined') delete args[key]
}

const defaults = {
  width: 1280,
  height: 720,
  bitDepth: 24,
  signalServer: 'ws://bunn.is',
  firefoxArgs: ''
};

export default {...defaults, ...args};