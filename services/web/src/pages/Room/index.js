import React, { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import turtus from 'turtus/core'

import VideoStream from '../../components/VideoStream'
import Icon from '../../icon-lib'
import VirtualBrowserController from '../../lib/BrowserController'
import WaitingElement from './WaitingElement'
import ChatItem from './ChatItem'
import Chat from './Chat'

// Debug purposes 
window.turtus = turtus

// TODO: Collapse to 20px or so when in collapsed mode
const ElementsContainer = styled.div`
  flex :.3;
  color : white;
  // background : ${({theme})=>theme.lighten.x1};
`

const RoomContainer = styled.div`
  flex : 1;
  height : 100%;
  display : flex;
  flex-direction : row;
`
const Container = styled.div`
  flex : 1;
  position : relative;
  display : flex;
  flex-direction : column;
  // padding : 20px 20px 0 20px;
  & video {
    width : 100%;
    background : black;
  }
  .waiting-component {
    position : absolute;
    top : 0;
    bottom : 3px;
    left : 0;
    right : 0;
  }
  & .click-shield {
    position : absolute;
    outline : none;
    top : 0;
    left : 0;
    right : 0;
    bottom : 3px;
    box-sizing : content-box;
    transition : 500ms all ease-in-out;
    box-shadow: 0 0 0 transparent;
    ${({focused})=>{
      if(!focused) return ''
      return `
        box-shadow: 0 0 30px rgba(255,255,255,0.2);
      `
    }}
  }
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
    <RoomContainer ref={ref}>
      <ElementsContainer>
        <ChatItem />
      </ElementsContainer>
      <Container className={'container'}>
        <VideoStream source={streamSource} vbController={vbController}>
          <WaitingElement onRequestBrowser={onRequestBrowser}/>
        </VideoStream>
        <Chat />
      </Container>
    </RoomContainer>
  )
}