import React, { useRef, useState, useEffect } from 'react'
import AspectRatio from 'react-aspect-ratio'
import useResizeObserver from 'use-resize-observer'
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
  }
`

export default function(props){
  const { 
    source,
    children,
    vbController,
    aspectRatio = 16/9
  } = props
  const ref = useRef()

  useEffect(()=>{
    const video = ref.current
    if ('srcObject' in video) {
      video.srcObject = source
    } else {
      video.src = window.URL.createObjectURL(source) // for older browsers
    }
  }, [source, ref])

  const [[vidWidth, vidHeight], setVidSize] = useState([1280, 720])
  // const [contRef, contWidth, contHeight] = useResizeObserver()

  // useEffect(()=>{
  //   if(contWidth === 1 || contHeight === 1)
  //     return
  //   // const width = contWidth > contHeight ? contHeight / aspectRatio : contWidth
  //   // const height = contHeight > contWidth ? 
  //   // const scale = Math.min(contWidth, contHeight)
  //   // setVidSize([width, height])
  // },[contWidth, contHeight, aspectRatio])

  const getMousePosition = (e) => {
    const video = ref.current 
    const rect = video.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return [x, y]
  }
  /**
   * 
   * @param {React.MouseEvent} e 
   * @param {*} btn 
   */
  const onMouseDown = (e, btn=0) => {
    if(btn >= 4 && btn <= 7)
      e.preventDefault()
    // e.preventDefault()
    if(!vbController) return false
    vbController.mouseDown(...getMousePosition(e), btn)
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
    console.log(ydir, xdir, btn)
    onMouseDown(e, btn)
  }
  /**
   * 
   * @param {React.KeyboardEvent} e 
   */
  const onKeyDown = (e) => {
    vbController.keyDown(e.key)
    e.preventDefault()
  }

  const onKeyUp = (e) => {
    vbController.keyUp(e.key)
    e.preventDefault()
  }
  // idea: when vidContainerInner size changes, dynamically change video size too
  return (
    <Container className={'container'}>
      <AspectRatio ratio={"16/9"} style={{ maxWidth: '1280px', margin : 'auto' }}>
        <video 
          ref={ref}
          onFocus={()=>console.log('Vid Focused')}
          onBlur={()=>console.log('Vid Blurred')}
          // width={1280}
          // height={720}
          autoPlay 
          onWheel={(e)=>onMouseWheel(e)}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onContextMenu={(e)=>onMouseDown(e, 3)}
          onMouseDown={(e) => onMouseDown(e, 1)}
          onMouseUp={(e) => onMouseUp(e, 1)}
          onMouseMove={onMouseMove} /> 
      </AspectRatio>
      { !source && <div className={'waiting-component'}>{children}</div> }
    </Container>
  )
}