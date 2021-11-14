//terminal command to compile
//deno run --allow-all ./compile.js
export { Animated } from './jdom/animated.js'
export { Text } from './jdom/text.js'
export { useHover,hover } from './jdom/hover.js'

import {flat} from './jdom/helpers.js'
import {wsInit} from './jdom/ws.js'

export const h = (type, props, ...children) =>
  type({ ...props, children: flat(children)});
export const Fragment = ({ children }) => ({ ch: flat(children) });


export const canvas = document.getElementById("root");
export const ctx = canvas.getContext("2d");
export var mousePosition = {x:0,y:0}
export var blink = false;
var numRenders = 0;
var dom = [];
var rendering = false;
export const shouldRender;

const clip = ({ x, y, w, h }) => {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
};

const stroke = ({ x, y, w, h, c='red', bg='white' }) => {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = c;
  ctx.strokeRect(x, y, w, h);
};

const text = ({ t, fs, x, y, w, h, c='black' }) => {
  ctx.fillStyle = c;
  ctx.font = `${fs}px serif`;
  const fontHeight = ctx.measureText("M").width;
  ctx.fillText(t, x, y + fontHeight);
};

const render = (node) => {
  console.log('render')
  dom.length = 0;
  var higherNodes = [node];
  var curZIndex = 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let doStrokeAll = (node) => {
    node.ch = typeof node.ch == 'function' ? node.ch(node) : node.ch
    if (node.zIndex > curZIndex) {
      higherNodes.push(node);
      return;
    }
    // node = applyParenting(node);
    dom.push(node);
    node.clip && clip(node);
    node.c && stroke(node);
    node.t && node.t.length > 0 && text(node);
    node.ch && node.ch.forEach((x) => doStrokeAll(x));
    node.clip && ctx.restore();
  };
  while (higherNodes.length > 0) {
    let nodes = [...higherNodes];
    higherNodes.length = 0;
    curZIndex++;
    nodes.forEach((n) => doStrokeAll(n));
  }
  // console.log(`${numRenders++} renders`)
};

const applyParenting = (node) =>
  !node.parent
    ? {
      ...node,
      ch: (node.ch || []).map((child) => ({
        ...child,
        zIndex: child.zIndex || node.zIndex,
      })),
    }
    : {
      ...node,
      ch: node.ch.map((child) => ({
        ...child,
        x: child.x + node.x,
        y: child.y + node.y,
        zIndex: child.zIndex || node.zIndex,
      })),
    };

export const run = (root) => {
  let el = document.getElementsByTagName("html")[0];
  Object.assign(el.style, {margin: 0,padding: 0,overscrollBehavior: "none"});
  el = document.getElementsByTagName("body")[0];
  Object.assign(el.style, {margin: 0,padding: 0,overscrollBehavior: "none"});

  wsInit()

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.translate(0.5, 0.5);

  console.log("App");
  console.log(root());

  render(root());
  // updateDom(root());
  console.log("dom");
  console.log(dom);

  shouldRender = () => {
    if (!rendering) {
      window.requestAnimationFrame(() => {
        // updateDom(root());
        render(root());
        rendering = false;
      });
      rendering = true;
    }
  };
  
  window.addEventListener("click", ({ offsetX: X, offsetY: Y }) => {
    let done = false;
    for (let node of dom.reverse()) {
      const { x, y, w, h } = node;
      if (
        X > x && X < x + w &&
        Y > y && Y < y + h
      ) {
        if (node.onClick && !done) {
          node.onClick();
          done = true;
        }
      } else {
        node.blur && node.blur();
      }
    }
    shouldRender();
  });

  window.addEventListener("keydown", (e) => {
    dom.forEach((el) => el.onKeyPress && el.onKeyPress({ e, el }));
    shouldRender();
  });

  window.addEventListener("mousedown", (e) => {
    const { offsetX: X, offsetY: Y } = e;
    dom.forEach((el) => {
      if (
        X > el.x && X < el.x + el.w &&
        Y > el.y && Y < el.y + el.h
      ) {
        el.onMouseDown && el.onMouseDown({ e, el });
      }
    });
    shouldRender();
  });

  window.addEventListener("mouseup", (e) => {
    dom.forEach((el) => el.onMouseUp && el.onMouseUp({ e, el }));
    shouldRender();
  });

  const handleWheel = (e) => {
    for (let el of dom.reverse()) {
      if (el.onWheel && el.onWheel({ e, el })) {
        shouldRender();
        break;
      }
    }
  };

  var drawing = false;
  window.addEventListener("wheel", (e) => {
    if (!drawing) {
      window.requestAnimationFrame(() => {
        handleWheel(e);
        drawing = false;
      });
      drawing = true;
    }
  });

  const handleMouseMove = (e) => {
    mousePosition = e
    dom.forEach((el) => {
      el.onMouseMove && el.onMouseMove({ e, el }) && shouldRender()
      el.onHover && el.onHover({ e, el }) && shouldRender()
    });
  }

  var updatingMousePosition = false
  window.addEventListener("mousemove", (e) => {
    if (!updatingMousePosition) {
      window.requestAnimationFrame(() => {
        handleMouseMove(e);
        updatingMousePosition = false;
      });
      updatingMousePosition = true;
    }
  });

  const handleAnimationFrame = () => {
    dom.forEach((el) =>
      el.onAnimationFrame && el.onAnimationFrame({ el }) && shouldRender()
    );
    window.requestAnimationFrame(handleAnimationFrame);
  };
  window.requestAnimationFrame(handleAnimationFrame);

  window.setInterval(() => {
    blink = !blink;
    shouldRender();
  }, 500);
};