import React, { useRef, useEffect } from 'react'
import styled from '@emotion/styled'

const VideoContainer = styled.div`
  display : flex;
  justify-content : center;
  align-items : center;
  box-sizing : content-box;
  margin : 20px 20px 0 20px;
  // background : black;
  flex : 1;
  position : relative;
  & video {
    width : auto;
    height : 100%;
    cursor : none;
  }
  .waiting-component {
    position : absolute;
    top : 0;
    left : 0;
    bottom : 0;
    right : 0;
  }
`
export default function(props){
  const { 
    source,
    children,
    vbController
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
    console.log(e.button, e.buttons, e.metaKey)
    e.preventDefault()
    if(!vbController) return
    vbController.mouseDown(...getMousePosition(e), btn)
  }

  const onMouseUp = (e, btn=0) => {
    e.preventDefault()
    if(!vbController) return
    vbController.mouseUp(...getMousePosition(e), btn)
  }
  // TODO: throttle number of mousemoves 
  const onMouseMove = (e) => {
    e.preventDefault()
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
    onMouseDown(e, btn)
  }

  return (
    <VideoContainer>
      <video 
        ref={ref}
        // width={1280}
        // height={720}
        autoPlay 
        onWheel={(e)=>onMouseWheel(e)}
        onContextMenu={(e)=>onMouseDown(e, 3)}
        onScroll={(e)=>onMouseDown(e, 2)}
        onMouseDown={(e) => onMouseDown(e, 1)}
        onMouseUp={(e) => onMouseUp(e, 1)}
        onMouseMove={onMouseMove} /> 
      
      { !source && <div className={'waiting-component'}>{children}</div> }
    </VideoContainer>
  )
}