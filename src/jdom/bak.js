// const strokeRoundedRect = (x, y, w, h, r) => {
//   // console.log(x,y,w,h,r)
//   ctx.save();
//   ctx.beginPath();
//   ctx.moveTo(x, y + r);
//   ctx.lineTo(x, y + h - r);
//   ctx.arcTo(x, y + h, x + r, y + h, r);
//   ctx.lineTo(x + w - r, y + h);
//   ctx.arcTo(x + w, y + h, x + w, y + h - r, r);
//   ctx.lineTo(x + w, y + r);
//   ctx.arcTo(x + w, y, x + w - r, y, r);
//   ctx.lineTo(x + r, y);
//   ctx.arcTo(x, y, x, y + r, r);
//   ctx.stroke();
//   ctx.restore();
// };

// const drawRect = ({ x, y, w, h, c }) => {
//   for (let dx = 0; dx < w; ++dx) {
//     for (let dy = 0; dy < h; ++dy) {
//       if (
//         (dy == 0 || dy == (h - 1) || dx == 0 || dx == (w - 1)) &&
//         masks.every((node) => isWithin(dx + x, dy + y, node))
//       ) {
//         buf32[dx + x + ((dy + y) * canvas.width)] = toHexColor(c);
//       }
//     }
//   }
// };

// const clearScreen = () => {
//   buf32.fill(0xFFFFFFFF);
//   imageData.data.set(buf8);
//   ctx.putImageData(imageData, 0, 0);
// };

// const isWithin = (dx, dy, bounds) => {
//   let { x, y, w, h } = bounds;
//   return (
//     dx >= x && dx < (x + w) &&
//     dy >= y && dy < (y + h)
//   );
// };

// const updateDom = (root) => {
//   dom.length = 0;
//   const doUpdateDom = (node) => {
//     node = applyParenting(node);
//     dom.push(node);
//     node.ch && node.ch.forEach((x) => doUpdateDom(x));
//   };
//   doUpdateDom(root);
// };

  // let imageData = ctx.getImageData(0,0,canvas.width,canvas.height)
  // let buf = new ArrayBuffer(imageData.data.length)
  // let buf8 = new Uint8ClampedArray(buf)
  // let buf32 = new Uint32Array(buf)

  const toHexColor = (s) => {
    colorContext.fillStyle = s;
    // remove #
    let color = colorContext.fillStyle.substring(1);
    // reorder bytes and add FF
    let alignedColor = "FF" +
      color.substring(4, 6) +
      color.substring(2, 4) +
      color.substring(0, 2);
    // parse the number
    return parseInt(alignedColor, 32);
  };
  const colorContext = document.createElement("canvas").getContext("2d");
  