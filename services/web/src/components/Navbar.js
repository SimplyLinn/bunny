import React from 'react' 
import styled from '@emotion/styled'

const NavbarContainer = styled.div`
  width : 100%;
  height : 100%;
  background : ${({theme}) => theme.darken.x1};
  display : flex;
  flex-direction : column;
`

export default function Navbar(){
  return (
    <NavbarContainer>
      <div>B</div>
      <div></div>
    </NavbarContainer>
  )
}