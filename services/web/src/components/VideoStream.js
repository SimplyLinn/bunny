import React, { useRef, useState, useEffect } from 'react'
import AspectRatio from 'react-aspect-ratio'
import styled from '@emotion/styled'


const Container = styled.div`
  flex : 1;
  position : relative;
  padding : 20px 20px 0 20px;
  & video {
    width : 100%;
    // background : black;
  }
  .waiting-component {
    position : absolute;
    top : 0;
    bottom : 0;
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
    source,
    children,
    vbController,
    fullscreen = false,
    aspectRatio = "16/9"
  } = props

  const ref = useRef()
  const controllerRef = useRef()
  const [focused, setFocused] = useState()

  useEffect(()=>{
    const video = ref.current
    if ('srcObject' in video) {
      video.srcObject = source
    } else {
      video.src = window.URL.createObjectURL(source) // for older browsers
    }
  }, [source, ref])

  useEffect(()=>{
    // prevent wheel scrolling from scrolling document
    if(!focused)
      return controllerRef.current && controllerRef.current.blur()
    controllerRef.current && controllerRef.current.focus()
    const lsnr = ()=>{ return false }
    window.addEventListener('wheel', lsnr)
    return () => window.removeEventListener('wheel',lsnr)
  }, [focused])

  const getMousePosition = (e) => {
    const video = ref.current 
    const rect = video.getBoundingClientRect()
    // todo: get the original width / height of the video from server?
    const originalW = 1280
    const originalH = 720
    const scaleX = originalW / rect.width
    const scaleY = originalH / rect.height
    const x = Math.round(scaleX * (e.clientX - rect.left))
    const y = Math.round(scaleY * (e.clientY - rect.top))
    console.log(x, y)
    return [x, y]
  }
  /**
   * 
   * @param {React.MouseEvent} e 
   * @param {*} btn 
   */
  const onMouseDown = (e, btn=0) => {
    if(!vbController) return false
    if(btn < 4 || btn > 7)
      e.preventDefault()
    // e.preventDefault()
    vbController.mouseDown(...getMousePosition(e), btn)
    return false
  }

  const onMouseUp = (e, btn=0) => {
    // e.preventDefault()
    if(!vbController) return
    vbController.mouseUp(...getMousePosition(e), btn)
  }
  // TODO: throttle number of mousemoves 
  const onMouseMove = (e) => {
    // e.preventDefault()
    if(!vbController) return 
    // TODO: Does current user control video
    // if(!vidFocus) return false;
    vbController.mouseMove(...getMousePosition(e))
  }

  const onMouseWheel = (e) => {
    let btn
    const ydir = Math.sign(e.deltaY);
    const xdir = Math.sign(e.deltaX)
    if(!xdir && !ydir) return
    if(ydir < 0) btn = 4
    if(ydir > 0) btn = 5
    if(xdir < 0) btn = 6
    if(xdir > 0) btn = 7
    return onMouseDown(e, btn)
  }
  /**
   * 
   * @param {React.KeyboardEvent} e 
   */
  const onKeyDown = (e) => {
    console.log(e.key)
    vbController.keyDown(e.key)
    e.preventDefault()
  }

  const onKeyUp = (e) => {
    vbController.keyUp(e.key)
    e.preventDefault()
  }
  // idea: when vidContainerInner size changes, dynamically change video size too
  return (
    <Container className={'container'} focused={focused} fullscreen={fullscreen}>
      <AspectRatio ratio={aspectRatio} style={{ maxWidth: '1280px', margin : 'auto', position:'relative' }}>
        <>
        <video ref={ref} autoPlay />
        <div 
          tabIndex="0"
          hidden={!source}
          className={'click-shield'}
          ref={controllerRef}
          onMouseEnter={()=>setFocused(true)}
          onMouseLeave={()=>setFocused(false)}
          onWheel={(e)=>onMouseWheel(e)}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onContextMenu={(e)=>onMouseDown(e, 3)}
          onMouseDown={(e) => onMouseDown(e, 1)}
          onMouseUp={(e) => onMouseUp(e, 1)}
          onMouseMove={onMouseMove}
        />
        </>
      </AspectRatio>
      { !source && <div className={'waiting-component'}>{children}</div> }
    </Container>
  )
}