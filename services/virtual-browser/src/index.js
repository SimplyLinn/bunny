import config from './config'
import VirtualBrowser from './lib/virtualBrowser'
import WrtcManager, { EVENT_TYPES } from './lib/WrtcManager'

(async()=>{
  let packet = null
  let timer = null
  let browserReady = false
  let virtualBrowser = null

  const wrtcOptions = { 
    signalServer : config.signalServer,
  }
  
  // Create the wrtc client first so that connection errors happen faster
  const wrtc = new WrtcManager(wrtcOptions)

  wrtc.on(EVENT_TYPES.PEER_MESSAGE, (peer, data)=>{
    if(!virtualBrowser){
      return 
    }
    const { type, args=[] } = data
    if(virtualBrowser[type]){
      return console.warn(`🤔 No handler for event: ${type}`)
    }
    virtualBrowser[type](...args)
  })

  wrtc.on(EVENT_TYPES.PEER_CONNECT, (peer) => {
    console.log('🤔 Peer Connected', peer.id || peer.cid)
    // let the particular peer know the stream is ready to be requested
    if(browserReady){
      peer.send(wrtc.package(EVENT_TYPES.STREAM.READY))
    }

    if(timer){
      clearTimeout(timer)
    }
  })

  wrtc.on(EVENT_TYPES.STREAM.REQUEST, (peer)=>{
    if(!virtualBrowser){
      return
    }
    peer.addStream(virtualBrowser.getStream())
  })

  wrtc.on(EVENT_TYPES.PEER_DISCONNECT, ()=>{
    if(wrtc.peers.size > 0 || config.timeout <= 0){
      return
    }
    if(timer){
      clearTimeout(timer)
    }
    timer = setTimeout(()=>{
      console.log("Timed Out Due To Idleness")
      process.exit(0)
    }, config.timeout)
  })

  try {
    await wrtc.init()
  }catch (e){
    console.error('😞', e)
    return process.exit(1)
  }
  console.log('🤔 WRTC Client Initialized')

  virtualBrowser = new VirtualBrowser(config)
  try {
    await virtualBrowser.init()
    browserReady = true
  }catch (e){
    console.error('😞', e)
    return process.exit(1)
  }
  console.log('🤔 Virtual Browser Initialized')
  packet = wrtc.package(EVENT_TYPES.STREAM.READY)
  wrtc.broadcast(packet)
  
  /*
   * No b.s., but this is a completely necessary console.log
   * for local development. The backend reads the stdout and 
   * looks for a smiley face in order to determine that the 
   * program is "ready". It's quick and dirty but it works.
   * see: server/lib/LocalDockerDriver.js
   */
  console.log('😊')
})()


