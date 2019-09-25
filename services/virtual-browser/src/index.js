import config from './conf'
import VirtualBrowser from './lib/virtualBrowser'
import WrtcClient from './lib/wrtcClient'

(async()=>{
  const virtualBrowser = new VirtualBrowser(config)
  await virtualBrowser.init()

  console.log('---Virtual Browser Initialized---')
  const wrtcClient = new WrtcClient({
    signalServer : config.signalServer, 
    virtualBrowser
  })
  wrtcClient.init()
  console.log('---WRTC Client Initialized---')
})()


