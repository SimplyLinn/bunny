import React from 'react' 
import styled from '@emotion/styled'

const Container = styled.div`
  display : flex;
  width : 100%;
  height : 100%;
  justify-content : center;
  align-items : center;
  > content {
    width : 45%;
    min-height : 300px;
    background : rgba(255,255,255,0.3);
    border-radius : 15px;
    display : flex;
    flex-direction : column;
    padding ; 5px;
  } 
  button {
    padding : 10px 5px;
    background : white;
    border : 1px solid black;
    outline : none;
  }
`

export default function WaitingElement(props){
  const { 
    onRequestBrowser
  } = props
  return (
    <Container>
      <content>
        <div>
          Where do you want to go?
          <input type={'text'}/>
        </div>
        <div>
          <button onClick={onRequestBrowser}>Get Me A Browser</button>
        </div>
      </content>
    </Container>
  )
}