import * as JDOM from "./jdom.js";
import { Text } from "./jdom.js";
import { TextInput } from "./components/textInput.js";
import { List } from "./components/list.js";
import { Slider } from "./components/slider.js";
import { DropDown } from "./components/dropDown.jsx";
import { useHover } from "./jdom/hover.js";
const dragProps = () => ({
  last: { x: 0, y: 0 },
  start: { x: 0, y: 0 },
  dragging: false,
  x: 0,
  y: 0,
});

var state = {
  draggables: [0].map((x) => ({
    id: x,
    ...dragProps(),
  })),
  textTest: [1, 2, 3].map((x) => TextInput.init(x)),
  //deno-fmt-ignore
  words: ["and","march","rules","real","hard","andy","march","rules","real","andy","march","rules","real","hard","andy","march","rules","real",],
  list: List.init(),
  list2: List.init(),
  list3: List.init(),
  list4: List.init(),
  page: { page: 0 },
  testSlider: Slider.init(),
  anim:JDOM.Animated(100),
  drop: DropDown.init()
};

const Draggable = ({ props, children }) => {
  let { last, start, dragging, x, y, id } = props;
  let ref = state.draggables.filter((x) => x.id == id)[0];
  let self = {
    ch: children,
    w: 100,
    h: 100,
    c: "purple",
    x,
    y,
    onMouseDown: ({ clientX, clientY }) => {
      ref.start = { x: clientX, y: clientY };
      ref.dragging = true;
    },
    onMouseMove: ({ clientX, clientY }) => {
      if (dragging) {
        ref.x = last.x + (clientX - start.x);
        ref.y = last.y + (clientY - start.y);
      }
      return (dragging);
    },
    onMouseUp: () => {
      ref.dragging = false;
      ref.last = { x, y };
    },
  };
  return self;
};

const Card = (
  {
    style: { w = 0, h = 0, t = "", pad = 0, fs = 12, x = 0, y = 0, c, zIndex=1 },
    onClick,onAnimationFrame
  },
) => ({
  x,
  y,
  w,
  h,
  c,
  zIndex,
  // clip: true,
  onClick,
  onAnimationFrame,
  // parent: true,
  ch:({x,y,w,h})=> [
    <HoverText
      center
      t={t}
      style={{
        x: x+pad,
        y: y+pad,
        w: w - pad * 2,
        h: h - pad * 2,
        c: "red",
        fs,
        r: 5,
      }}
    />,
  ],
});

const Page = ({ state, page, children }) => ({
  ch: state.page == page ? children : [],
  x: 0,
  y: 0,
  w: 0,
  h: 0,
});

const handleChildren = ({children,vertical, style}) => {
  const {spread,fill} = style
  const totalChildrenWidth = children.reduce((a,c)=>a+(vertical?c.h:c.w),0)
  const extraWidth = (vertical?style.h:style.w) - totalChildrenWidth
  const extraWidthPer = extraWidth / children.length
  var ch = children
  if(spread){
    var offset = 0
    var newCh = []
    ch.forEach(child=>{
      const {x,y,w,h} = child
      const rx = style.x + x + offset + extraWidthPer/2
      const ry = style.y + y + offset + extraWidthPer/2
      offset += (vertical ? y : x) + extraWidthPer + (vertical ? h : w) + 1
      newCh.push({
        ...child,
        y:vertical ? ry : y+style.y,
        x:vertical ? x+style.x : rx,
      })
    })
    ch = newCh
  }else if(fill){
    var offset = 0
    var newCh = []
    children.forEach(child=>{
      const {x,y,w,h} = child
      const rx = style.x + offset
      const ry = style.y + offset
      offset += (vertical ? h : w) + extraWidthPer + 1
      newCh.push({
        ...child,
        x:vertical ? style.x + x : rx,
        y:vertical ? ry : style.y + y,
        w:vertical ? style.w : w+extraWidthPer,
        h:vertical ? h+extraWidthPer : style.h,
      })
    })
    ch = newCh
  }else{
    var offset = 0
    var newCh = []
    children.forEach(child=>{
      const {x,y,w,h} = child
      const rx = style.x + offset
      const ry = style.y + offset
      offset += (vertical ? h : w) + 1
      newCh.push({
        ...child,
        x:vertical ? style.x + x : rx,
        y:vertical ? ry : style.y + y,
      })
    })
    ch = newCh
  }
  return ch
}

const Row = ({style,vertical,children}) => {
  return({
    ...style,
    ch:(style)=>handleChildren({children,style,vertical:false})
  })
}
const Column = ({style,vertical,children}) => {
  return({
    ...style,
    ch:handleChildren({children,style,vertical:true})
  })
}

const HoverText = ({style,t,center}) => {
  return({
    ...style,
    ch:(style)=>{
      const [hover,onHover] = JDOM.useHover(style)
      return([
        <Text
          center={center}
          t={t}
          style={{...style,c:hover?'red':'blue',w:hover?style.w+20:style.w}}
          onHover={onHover}
        />
      ])
    }
  })
}

const App = () =>
  <JDOM.Fragment>
    {/* <Page state={state.page} page={0}>
            <Card style={{t:'zero',x:10,y:10,w:100,h:100,c:'red',fs:20,pad:0}}/>
        </Page>
        <Page state={state.page} page={1}>
            <Card style={{t:'one',x:10,y:10,w:100,h:100,c:'red',fs:20,pad:0}}/>
        </Page>
        <Page state={state.page} page={2}>
            <Card style={{t:'two',x:10,y:10,w:100,h:100,c:'red',fs:20,pad:0}}/>
        </Page>
        <Card style={{w:40,h:30,x:150,y:150,t:"+",fs:20,c:'green',pad:5}} onClick={()=>state.page.page=state.page.page>1?0:state.page.page+1}/> */}
    <Slider style={{ x: 10, y: 200, w: 200, h: 18 }} state={state.testSlider} />
    <List
      style={{ x: 100, y: 10, w: 530, h: 120, c: "green" }}
      state={state.list}
      vertical
    >
      <List style={{ w: 530, h: 60, c: "red" }} state={state.list2}>
        {state.words.map((word) =>
          <Card 
            style={{ w: 60, h: 50, pad: 5, fs: 14, t: word }} 

          />
        )}
      </List>
      <List style={{ w: 530, h: 60, c: "blue" }} state={state.list3}>
        {state.words.map((word) =>
          <Card style={{ w: 60, h: 50, pad: 5, fs: 14, t: word }} />
        )}
      </List>
      <List style={{ w: 530, h: 60, c: "blue" }} state={state.list4}>
        {state.words.map((word) =>
          <Card style={{ w: 60, h: 50, pad: 5, fs: 14, t: word }} />
        )}
        <TextInput
          state={state.textTest[0]}
          style={{ x: 0, y: 0, w: 100, h: 30, fs: 14 }}
        />
      </List>
    </List>
    <Card 
        style={{w:state.anim.val,h:100,x:10,y:300,t:'anim',fs:12,zIndex:3}}
        onClick={()=>state.anim.to({end:state.anim.val==100?400:100,duration:1,easing:'quad'})
                    .then(()=>state.anim.to({end:state.anim.val==100?400:100,duration:1,easing:'quad'}))
                    .then(()=>state.anim.to({end:state.anim.val==100?400:100,duration:1,easing:'quad'}))
                    .then(()=>state.anim.to({end:state.anim.val==100?400:100,duration:1,easing:'quad'}))
                }
        onAnimationFrame={()=>state.anim.active}
    />
    <DropDown
        state = {state.drop}
        style={{x:200,y:300,w:100,h:30,}}
        opts={['one','two','three']}
    />
    <Row style={{x:10,y:450,w:800,h:60,c:'red',fill:true}}>
      <HoverText 
        style={{x:0,y:0,w:60,h:20,fs:14,c:'blue'}}
        center
        t='test'
      />
      <Text 
        style={{x:0,y:0,w:30,h:20,fs:14,c:'green'}}
        center
        t='test2'
      />
      <Text 
        style={{x:0,y:0,w:30,h:20,fs:14,c:'purple'}}
        center
        t='test3'
      />
      <Text 
        style={{x:0,y:0,w:30,h:20,fs:14,c:'gold'}}
        center
        t='test4'
      />
    </Row>
  </JDOM.Fragment>;

JDOM.run(App);
