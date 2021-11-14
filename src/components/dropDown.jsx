import * as JDOM from "../jdom.js"
import {Text} from "../jdom.js"

const ddAnim = x => ({
    duration:0.2,
    easing:'quad',
    end:x
})

export const DropDown = ({style,state,opts,prompt,children}) => {
    var {x,y,w,h} = style
    var {val,index,open,height} = state
    var options = open ? opts : []
    var text = index== -1 ? prompt || 'select' : val
    // var text = index== -1 ? prompt || 'select' : open ? prompt || 'select' : val
    return({
        ...style,
        ch:[{
            ...style,
            h:h+height.val,
            // parent:true,
            c:open?'lightGrey':'black',
            clip:true,
            onAnimationFrame:()=>state.height.active,
            onClick:()=>{
                if(state.open){
                    //closing
                    state.height.to(ddAnim(0))
                    .then(()=>state.open=false)
                } else {
                    //opening
                    state.open = true
                    state.height.to(ddAnim(opts.length * (h-1)))
                }
            },
            blur:()=>state.open && state.height.to(ddAnim(0)).then(()=>state.open=false),
            ch:({x,y,w})=>[
                ...options.map((t,i)=>({
                    x:x+1,
                    y:y+(((i+1)*h)-(1+1*i)+1),
                    c:'black',
                    // parent:true,
                    zIndex:2,
                    w:w-2,
                    h:h-2,
                    bg:'white',
                    ch:({x,y,w,h})=>[<Text center t={t} style={{...style,x,y,fs:14}} />],
                    onClick:()=>{
                        state.val=t,
                        state.index=i
                        state.height.to(ddAnim(0)).then(()=>state.open=false)
                    },
                })),
                // caret
                {
                    x:w-18,
                    y:y+8,
                    // fs:20,
                    t:open ? '\u1403' : '\u1401'
                },
                // text
                <Text center t={text} style={{...style,x,y,fs:14}} />,
            ]
        }]
    })
}

DropDown.init = () => ({
    val:'',
    index:-1,
    open:false,
    height:JDOM.Animated(0)
})