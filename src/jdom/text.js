const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const measureText = (t,fs) => {
    ctx.font = `${fs}px serif`
    return ctx.measureText(t)
}

export const Text = ({ center, t, style, ...props}) => {
  const { x, y, w, h, fs } = style;
  ctx.font = `${fs}px serif`;
  return ({
    ...style,
    ...props,
    // parent: true
    // clip:true,
    ch: ({x,y,w,h})=>([{
      t,
      fs,
      x: x + (center ? (w - measureText(t,fs).width) / 2 : 0),
      y: y + (center ? (h - measureText("Mi",fs).width) / 2 : 0),
    }]),
  });
};
  
