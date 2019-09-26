import React from 'react' 

export default function WaitingElement(props){
  const { 
    onRequestBrowser
  } = props
  return (
    <div>
      <button onClick={onRequestBrowser}>Get Me A Browser</button>
    </div>
  )
}