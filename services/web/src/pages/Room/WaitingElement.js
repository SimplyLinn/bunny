import React from 'react' 
import styled from '@emotion/styled'

import Icon from '../../icon-lib'

const Container = styled.div`
  display : flex;
  user-select : none;
  width : 100%;
  height : 100%;
  justify-content : center;
  align-items : center;
  font-family : helvetica, arial;
  h2 {
    font-size : 2em;
  }

  h3 {
    font-size : 1.5em;
  }
  > content {
    color : white;
    width : 45%;
    min-height : 300px;
    width : 100%;
    border-radius : 15px;
    display : flex;
    align-items : center;
    justify-content : space-around;
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

const Options = styled.div`
  display : flex;
  flex-direction : row;
  > div {
    margin : 10px 15px;
    cursor : pointer;
    text-align : center;
    transition : 200ms ease-out;
    flex : 1;
    display : flex;
    flex-direction : column;
    &:hover {
      transform : scale(1.05);
    }

    align-items : center;
    > * {
      margin : 8px 0;
    }
    > svg {
      font-size : 60px;
    }
    > span {
      max-width : 150px;
    }
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
          <h2>How Do You Want To Stream? </h2>
        </div>
        <Options>
          <div onClick={onRequestBrowser}>
            <h3>From A Virtual Machine</h3>
            <Icon icon="robot" />
            <span>Share a browser on a virtual machine that anyone can control.</span>
          </div>
          <div>
            <h3>From My Computer</h3>
            <Icon icon="laptop" />
            <span>Stream a tab, window, or entire desktop from your local computer.</span>
          </div>
          <div>
            <h3>From URL</h3>
            <Icon icon="link" />
            <span>Stream from a variety of supported websites such as YouTube</span>
          </div>
        </Options>
      </content>
    </Container>
  )
}