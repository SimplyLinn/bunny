import React, { useRef, useEffect } from 'react'

export default function(props){
  const { source } = props
  const ref = useRef()
  useEffect(()=>{
    const video = ref.current
    if ('srcObject' in video) {
      video.srcObject = source;
    } else {
      video.src = window.URL.createObjectURL(source) // for older browsers
    }
  }, [source, ref])
  const onMouseDown = () => {}
  const onMouseUp = () => {}
  const onMouseMove = () => {}
  return (
    <video 
      ref={ref}
      autoPlay 
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove} />
  )
}