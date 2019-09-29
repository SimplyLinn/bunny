import React, { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import WRTCSessionManager, {EVENT_TYPES} from '../../lib/SocketController'
import VideoStream from '../../components/VideoStream'
import Icon from '../../icon-lib'
import VirtualBrowserController from '../../lib/BrowserController'
import WaitingElement from './WaitingElement'

// TODO: Collapse to 20px or so when in collapsed mode
const ElementsContainer = styled.div`
  flex : 0;
  flex-basis : 100px;
  color : white;
  display : flex;
  & button {
    cursor : pointer;
    background : transparent;
    outline : none;
    color : white;
    border : none;
    padding : 5px;
    font-size : 24px;
  }
`

const RoomContainer = styled.div`
  flex : 1;
  height : 100%;
  display : flex;
  flex-direction : column;
`

export default function(props){
  const { 
    // todo: include room url
    server = `wss://${window.location.hostname}`
  } = props

  const [streamSource, setStreamSource] = useState()
  const [vbController, setVBController] = useState()
  const ref = useRef()

  useEffect(()=>{
    const manager = new WRTCSessionManager({server})
    manager.on('open', async () => {
      // const browserId = await VirtualBrowserController.createInstance()
    })
    manager.on(EVENT_TYPES.PEER_CONNECT, (peer) => {
      console.log(`Peer Connected: ${peer.id}`)
    })
    
    manager.on('browser.stream', (peer, stream)=>{
      console.log('Stream Received', stream)
      setStreamSource(stream)
      // set the controller
      setVBController(new VirtualBrowserController(peer))
    })

    ;(async()=>{
      await manager.init()
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
    <RoomContainer ref={ref}>
      <VideoStream source={streamSource} vbController={vbController}>
        <WaitingElement onRequestBrowser={onRequestBrowser}/>
      </VideoStream>
      <ElementsContainer>
        <button onClick={toggleFullscreen}>
          <Icon icon='expand'/>
        </button>
      </ElementsContainer>
    </RoomContainer>
  )
}