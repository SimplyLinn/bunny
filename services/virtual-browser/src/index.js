import config from './conf'
import VirtualBrowser from './lib/virtualBrowser'
import WrtcClient from './lib/wrtcClient'

(async()=>{
  const wrtcOptions = { signalServer : config.signalServer }
  console.log(wrtcOptions)
  // Create the wrtc client first so that connection errors happen faster
  const wrtcClient = new WrtcClient(wrtcOptions)
  try {
    await wrtcClient.init()
  }catch (e){
    console.error('😞', e)
    return process.exit(1)
  }
  console.log('🤔 WRTC Client Initialized')

  const virtualBrowser = new VirtualBrowser(config)
  try {
    await virtualBrowser.init()
  }catch (e){
    console.error('😞', e)
    return process.exit(1)
  }
  console.log('🤔 Virtual Browser Initialized')
  
  wrtcClient.setVirtualBrowser(virtualBrowser)
  /*
   * No b.s., but this is a completely necessary console.log
   * for local development. The backend reads the stdout and 
   * looks for a smiley face in order to determine that the 
   * program is "ready". It's quick and dirty but it works.
   * see: server/lib/LocalDockerDriver.js
   */
  console.log('😊')
})()


