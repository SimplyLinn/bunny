import React, { useEffect, useRef, useState } from 'react'
import turtus from 'turtus/core'
import { Box } from 'grommet'

import VideoStream from '../../components/VideoStream'
import VirtualBrowserController from '../../lib/BrowserController'
import WaitingElement from './WaitingElement'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'

// Debug purposes 
window.turtus = turtus

export default function(props){
  const { 
    // todo: include room url
    server = `wss://${window.location.hostname}`
  } = props

  const [streamSource, setStreamSource] = useState()
  const [vbController, setVBController] = useState()
  const ref = useRef()

  useEffect(()=>{
    const opts = {
    }
    const adapter = new turtus.Adapters.WebSocketAdapter(server)
    const manager = new turtus.P2PManager(opts)
    manager.setAdapter(adapter)

    adapter.on(turtus.ADAPTER_EVENTS.CONNECTED, async () => {
      console.log('Websocket connection opened to server')
    })

    manager.on(turtus.PEER_EVENTS.PEER_CONNECT, (peer) => {
      console.log(`Peer Connected: ${peer.id}`)
    })
    
    manager.on('browser.stream', (peer, stream)=>{
      console.log('Stream Received', stream)
      setStreamSource(stream)
      // set the controller
      setVBController(new VirtualBrowserController(peer))
    })

    ;(async()=>{
      const id = await manager.init()
      console.log('Id:', id)
      console.log('Initialized')
      // setInitialized()
    })()

    return () => manager.destroy()
  }, [server])

  const toggleFullscreen = () => {
    // eslint-disable-next-line
    const prefixes = new Array('moz', 'ms', 'webkit')
    if(!document.fullscreenEnabled || !prefixes.some(prefix=>document[`${prefix}FullscreenEnabled`])){
      return false
    }
    return prefixes.some(prefix => {
      if(typeof document[`${prefix}FullscreenElement`] === 'undefined') return false
      if(!document[`${prefix}FullscreenElement`]) {
        ref.current[`${prefix}RequestFullscreen`]()
      }else{
        document[`${prefix}ExitFullscreen`]()
      }
      return true
    })
  }

  // Create a virtual browser in this room
  const onRequestBrowser = async () => {
    console.log('onRequestBrowser')
    const browserId = await VirtualBrowserController.createInstance()
    console.log(browserId)
  }

  return (
    <Box 
      fill
      background="base"
      direction="row" 
      ref={ref}>
      <Toolbar />
      <VideoStream source={streamSource} vbController={vbController}>
        <WaitingElement onRequestBrowser={onRequestBrowser}/>
      </VideoStream>
      <Sidebar />
    </Box>
  )
}