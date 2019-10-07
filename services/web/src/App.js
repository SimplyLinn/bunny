import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { Box, Grommet } from 'grommet'

import './icon-lib.js'
import RoomPage from './pages/Room'
import FullScreen from './components/layouts/FullScreen'
import ResetCSS from './ResetCSS'
import { lightTheme } from './theme'


function App() {
  // TODO: use mobx to switch themes/preferences
  return (
    <Grommet theme={lightTheme} >
      <FullScreen>
        <ResetCSS />
        <BrowserRouter>
          <Box direction="column" width="100vw" height="100vh">
            <Box fill>
              <Route path="/" exact component={RoomPage} />
            </Box>
          </Box>
        </BrowserRouter>
      </FullScreen>
    </Grommet>
  )
}

export default App;
