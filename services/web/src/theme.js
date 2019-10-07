import { grommet } from 'grommet'
import { deepMerge } from "grommet/utils"

export default {
  dark : {
    name : 'dark',
    background : {
      primary : '#1B1C26',
      secondary : '#1B1C26'
    },
    darken : {
      x1 : 'rgba(0,0,0,0.2)'
    },
    lighten : {
      x1 : 'rgba(255,255,255,0.1)'
    },
    text : {
      primary : 'white',
      secondary : 'white'
    },
  },
  light : {
    name : 'light'
  }
}

export const lightTheme = deepMerge(grommet, {
  global : {
    colors : {
      black : '#1F1F1F',
      white : '#FFFFFF',
      accent1 : '#939770',
      accent2 : '#364432',
      base : '#f4f6f8',
      toolbar : 'white',
      border : '#dadada',
      header : 'white'
    },
    size : {
      xsmall : '80px'
    }
  },
  tabs : {
    header : {
      background : 'header',
      extend : ()=>({
        justifyContent : 'space-around'
      })
    }
  }
})

// TODO
export const darkTheme = deepMerge(grommet, {
  global : {}
})