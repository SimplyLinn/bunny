import styled from '@emotion/styled'

export default styled.div`
  width  : 100%;
  height : 100%;
  overflow-x : ${({scrollX})=>{
    if(!scrollX) return 'hidden'
    if(scrollX === true) return 'scroll'
    return scrollX
  }};
  overflow-y : ${({scrollY})=>{
    if(!scrollY) return 'hidden'
    if(scrollY === true) return 'scroll'
    return scrollY
  }};
  overflow : ${({scroll})=>{
    if(!scroll) return 'hidden'
    if(scroll === true) return 'scroll'
    return scroll
  }};
`