import React from 'react' 
import styled from '@emotion/styled'

const Container = styled.div`
  display : flex;
  flex : 3;
  flex-direction : column;
`

const ChatLog = styled.div`
  flex : 1;
`

const ChatInput = styled.div`
  flex : 0;
  margin : 25px 10px;
  background : ${({theme})=>theme.lighten.x1};
  border-radius : 4px;
  input {
    font-size : 18px;
    padding : 5px;
    padding-left : 25px;
    color : rgba(255,255,255,0.8);
    border : none;
    background : transparent;
    outline : none;
    width : 100%; 
    height : 30px;
  }
`

export default function(props){
  const { 
    stream
  } = props
  return (
    <Container>
      <ChatLog stream={stream} />
      <ChatInput>
        <input type='text' />
      </ChatInput>
    </Container>
  )
}