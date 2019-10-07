import React from 'react' 
import styled from '@emotion/styled'
import { Stack, TextInput, TextArea, Box } from 'grommet'
import Icon from '../../../icon-lib'

const Container = styled.div`
  display : flex;
  flex : 3;
  flex-direction : column;
`

const ChatLog = styled.div`
  flex : 1;
`

export default function(props){
  const { 
    stream
  } = props
  return (
    <Box direction="column" fill>
      <Box fill>

      </Box>
      <Stack flex={false} anchor={'right'}>
        <TextArea rows={1} resize={false}/>
        <Box pad={'10px'}>
          <Icon icon="paper-plane"/>
        </Box>
      </Stack>
    </Box>
  )
}