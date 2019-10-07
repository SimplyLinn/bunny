import React from 'react'
import { Box } from 'grommet'
import Icon from '../../../icon-lib'

function ToolbarItem({
  icon,
  disabled = false,
  toggled = false,
  children, 
  size = 20, 
  ...props}
){
  return (
    <Box
      flex={false}
      style={{fontSize:size}}
      basis="xsmall" 
      justify="center"
      align="center"
      {...props} >
      { icon 
        ? <Icon color={disabled ? 'gray' : 'inherit'} icon={icon}/>
        : children
      }
    </Box>
  )
}

export default function Toolbar(){
  return (
    <Box 
      background="toolbar"
      direction="column"
      flex={false}
      basis="xsmall">
        <ToolbarItem 
          flex={false}
          basis="xxsmall"
          height="xxsmall" 
          background="header" 
          border="bottom">
          T
        </ToolbarItem>
        <Box>
          <ToolbarItem size={32} icon={'user-circle'}/>
          <ToolbarItem disabled icon={'microphone-slash'}/>
          <ToolbarItem disabled icon={'video-slash'}/>
        </Box>
        <Box fill justify="end">
          <ToolbarItem />
        </Box>
    </Box>
  )
}