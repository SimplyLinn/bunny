import React from 'react'
import { ThemeProvider } from 'emotion-theming'
import { BrowserRouter, Route } from 'react-router-dom'
import styled from '@emotion/styled'

import './icon-lib.js'
import RoomPage from './pages/Room'
import FullScreen from './components/layouts/FullScreen'
import ResetCSS from './ResetCSS'
import theme from './theme'
import Navbar from './components/Navbar'

const AppContainer = styled.div`
  width : 100vw;
  height : 100vh;
  display : flex;
  flex-direction : row;
  background : ${({theme})=>theme.background.primary};
`

const RouteContainer = styled.div`
  flex : 1;
  // order : 0;
`

const NavbarContainer = styled.div`
  min-width : 65px;
  box-sizing : content-box;
  order : 0;
  background : ${({theme})=>theme.background.secondary};
`
// const webrtcSignalServer = 'wss://10.0.75.1:8443'

function App() {
  // TODO: use mobx to switch themes/preferences
  return (
    <ThemeProvider theme={theme.dark}>
      <FullScreen>
        <ResetCSS />
        <BrowserRouter>
          <AppContainer>
            <NavbarContainer>
              <Navbar />
            </NavbarContainer>
            <RouteContainer>
              <Route path="/" exact component={RoomPage} />
            </RouteContainer>
          </AppContainer>
        </BrowserRouter>
      </FullScreen>
    </ThemeProvider>
  )
}

export default App;
