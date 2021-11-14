import {mousePosition,shouldRender} from '../jdom.js'

export function useHover(el){
    const isOver = hover(el)
    var onHover = ({el}) => {
        var shouldCauseRender = false
        const {x,y,w,h} = el
        const {x: mx, y: my} = mousePosition
        if(
          mx > x && mx < (x+w) &&
          my > y && my < (y+h)
        ){
          if(!isOver){
            shouldCauseRender=true
          }
          // isOver = true
        } else {
          if(isOver){
            shouldCauseRender=true
          }
          // isOver = false
        }
        return shouldCauseRender
      }
    return ([isOver,onHover])
  }
  
  var shouldRerender = false
  
  export const hover = (el) => {
    const {x,y,w,h} = el
    const {x: mx, y: my} = mousePosition
    if(
      mx > x && mx < (x+w) &&
      my > y && my < (y+h)
    ){
      shouldRerender = true
      shouldRender()
      return true
    }
    // this ensures that it will render once more on mouse out
    shouldRerender && shouldRender()
    shouldRerender = false
    return false
  }