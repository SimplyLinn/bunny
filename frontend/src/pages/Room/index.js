import React, { useEffect, useState } from 'react'
import WRTCSessionManager from '../../lib/SocketController'
import VideoStream from '../../components/VideoStream'

export default function(props){
  const { 
    server = `wss://${window.location.hostname}`
  } = props

  const [streamSource, setStreamSource] = useState()

  useEffect(()=>{
    const manager = new WRTCSessionManager({server})
    manager.addListener('peer.connect', (data)=>{
      console.log(`Peer Connected: ${data}`)
    })
    manager.addListener('peer.stream', (d)=>{
      console.log('stream', d)
      setStreamSource(d)
    })
    return () => manager.destroy()
  }, [server])

  return (
    <div>
      <VideoStream source={streamSource}/>
    </div>
  )
}