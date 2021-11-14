import * as JDOM from "../jdom.js"

const layoutAsList = ({children,scroll,vertical,style}) => {
    const {x=0,y=0,w,h} = style
    var ch = []
    var offset = 0
    for(let child of children){
        ch.push({
            ...child,
            x:vertical ? x : x+offset+scroll,
            y:vertical ? y+offset+scroll : y,
            // parent:true
        })
        offset += (vertical ? child.h : child.w)
    }
    return ({ch,offset})
}

export const List = ({style,state,children=[],vertical=false}) => {
    let {offset} = layoutAsList({children,scroll:state.scroll,vertical,style})
    let maxScroll = offset - (vertical ? style.h : style.w)
    return({
        ...style,
        vertical,
        // parent:true,
        ch:(style)=>layoutAsList({children,scroll:state.scroll,vertical,style}).ch,
        offset,
        clip:true,
        onWheel:({e,el})=>{
            let {clientX,clientY,deltaY,deltaX,timeStamp} = e
            let {x,y,w,h,vertical} = el
            if(
                clientX > x && clientX < (x+w) &&
                clientY > y && clientY < (y+h)
            ){
                if(timeStamp - state.lastScrollTime > 100){
                    state.scrollVertical = Math.abs(deltaX) < Math.abs(deltaY)
                }
                state.lastScrollTime = timeStamp
                if(vertical == state.scrollVertical){
                    state.scroll += (vertical ? deltaY : deltaX)
                    state.scroll = Math.max(-maxScroll, Math.min(0,state.scroll))
                    return true
                }
            }
            return false
        }
    })
}

List.init = () => ({
    scroll:0,
    lastScrollTime: 0,
    scrollVertical: false
})