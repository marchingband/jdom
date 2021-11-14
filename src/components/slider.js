import * as JDOM from '../jdom.js'

export const Slider = ({style,state}) => {
    const {x,y,w,h} = style
    const {offset,dragging,start,last}= state
    const [hover,onHover] = JDOM.useHover({
        x:x+offset,
        y:y-(h/2),
        h,
        w:h,
    })
    return ({
        x,y,w,h,
        // parent:true,
        ch:({x,y,w,h})=>[
            // line
            {x,y,w,h:1,c:'red'},
            // box
            {
                x: x + (hover || dragging ? offset - 3 : offset),
                y: y + (hover || dragging ? -(h/2 + 3) : -(h/2)),
                h: hover || dragging ? h+6 : h,
                w: hover || dragging ? h+6 : h,        
                c:'green',
                onHover,
                onMouseDown:({e:{clientX}})=>{
                    state.dragging = true
                    state.start = clientX
                    return true
                },
                onMouseUp:()=>{
                    state.dragging = false
                    state.last = offset
                    return true
                },
                onMouseMove:function({e:{x:mx}}){
                    if(dragging){
                        state.offset = Math.max(0,Math.min(w-h,mx - start + last))
                    }
                    return dragging
                },
            }
        ],
    })
}
Slider.init = () => ({
    dragging:false,
    start:0,
    offset:0,
    last:0
})
