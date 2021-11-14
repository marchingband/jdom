// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("jdom/animated", [], function (exports_1, context_1) {
    "use strict";
    var easings, Animated;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            easings = {
                quad: (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
                sin: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
            };
            exports_1("Animated", Animated = (init) => {
                var anim = {
                    val: init,
                    start: init,
                    startTime: 0,
                    init: init,
                    active: false,
                    progress: 0,
                    to: ({ end, duration = 1, easing = "sin" }) => new Promise((res, rej) => {
                        if (anim.active && anim.ref) {
                            cancelAnimationFrame(anim.ref);
                            anim.startTime = 0;
                        }
                        const growing = end > anim.val;
                        anim.active = true;
                        anim.start = anim.val;
                        anim.ref = undefined;
                        function handleAnimationFrame(timestamp) {
                            if (anim.startTime == 0) {
                                anim.startTime = timestamp;
                            }
                            if (timestamp <= (anim.startTime + duration * 1000)) {
                                anim.progress = (timestamp - anim.startTime) / (duration * 1000);
                                let easedProgress = easing
                                    ? easings[easing](anim.progress)
                                    : anim.progress;
                                let offset = easedProgress * (end - anim.start);
                                let position = growing
                                    ? Math.ceil(anim.start + offset)
                                    : Math.floor(anim.start + offset);
                                anim.val = position;
                                anim.ref = window.requestAnimationFrame(handleAnimationFrame);
                            }
                            else {
                                anim.startTime = 0;
                                anim.active = false;
                                anim.ref = undefined;
                                anim.val = end;
                                res();
                            }
                        }
                        anim.ref = window.requestAnimationFrame(handleAnimationFrame);
                    }),
                };
                return anim;
            });
        }
    };
});
System.register("jdom/text", [], function (exports_2, context_2) {
    "use strict";
    var canvas, ctx, measureText, Text;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");
            measureText = (t, fs) => {
                ctx.font = `${fs}px serif`;
                return ctx.measureText(t);
            };
            exports_2("Text", Text = ({ center, t, style, ...props }) => {
                const { x, y, w, h, fs } = style;
                ctx.font = `${fs}px serif`;
                return ({
                    ...style,
                    ...props,
                    ch: ({ x, y, w, h }) => ([{
                            t,
                            fs,
                            x: x + (center ? (w - measureText(t, fs).width) / 2 : 0),
                            y: y + (center ? (h - measureText("Mi", fs).width) / 2 : 0),
                        }]),
                });
            });
        }
    };
});
System.register("jdom/hover", ["jdom"], function (exports_3, context_3) {
    "use strict";
    var jdom_js_1, shouldRerender, hover;
    var __moduleName = context_3 && context_3.id;
    function useHover(el) {
        const isOver = hover(el);
        var onHover = ({ el }) => {
            var shouldCauseRender = false;
            const { x, y, w, h } = el;
            const { x: mx, y: my } = jdom_js_1.mousePosition;
            if (mx > x && mx < (x + w) &&
                my > y && my < (y + h)) {
                if (!isOver) {
                    shouldCauseRender = true;
                }
            }
            else {
                if (isOver) {
                    shouldCauseRender = true;
                }
            }
            return shouldCauseRender;
        };
        return ([isOver, onHover]);
    }
    exports_3("useHover", useHover);
    return {
        setters: [
            function (jdom_js_1_1) {
                jdom_js_1 = jdom_js_1_1;
            }
        ],
        execute: function () {
            shouldRerender = false;
            exports_3("hover", hover = (el) => {
                const { x, y, w, h } = el;
                const { x: mx, y: my } = jdom_js_1.mousePosition;
                if (mx > x && mx < (x + w) &&
                    my > y && my < (y + h)) {
                    shouldRerender = true;
                    jdom_js_1.shouldRender();
                    return true;
                }
                shouldRerender && jdom_js_1.shouldRender();
                shouldRerender = false;
                return false;
            });
        }
    };
});
System.register("jdom/helpers", [], function (exports_4, context_4) {
    "use strict";
    var flat;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
            exports_4("flat", flat = (a) => {
                let out = [];
                a.forEach((x) => {
                    if (x.length) {
                        out = [...out, ...x];
                    }
                    else {
                        out.push(x);
                    }
                });
                return out;
            });
        }
    };
});
System.register("jdom/ws", [], function (exports_5, context_5) {
    "use strict";
    var wsInit;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            exports_5("wsInit", wsInit = () => {
                console.log("starting ws client");
                const ws = new WebSocket("ws://localhost:8080");
                ws.onopen = () => {
                    console.log("ws connected");
                    ws.send("test");
                };
                ws.onmessage = (e) => {
                    console.log("ws message in:");
                    console.log(e);
                    if (e.data == "reload") {
                        window.location.reload();
                    }
                };
            });
        }
    };
});
System.register("jdom", ["jdom/animated", "jdom/text", "jdom/hover", "jdom/helpers", "jdom/ws"], function (exports_6, context_6) {
    "use strict";
    var helpers_js_1, ws_js_1, h, Fragment, canvas, ctx, mousePosition, blink, numRenders, dom, rendering, shouldRender, clip, stroke, text, render, applyParenting, run;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (animated_js_1_1) {
                exports_6({
                    "Animated": animated_js_1_1["Animated"]
                });
            },
            function (text_js_1_1) {
                exports_6({
                    "Text": text_js_1_1["Text"]
                });
            },
            function (hover_js_1_1) {
                exports_6({
                    "useHover": hover_js_1_1["useHover"],
                    "hover": hover_js_1_1["hover"]
                });
            },
            function (helpers_js_1_1) {
                helpers_js_1 = helpers_js_1_1;
            },
            function (ws_js_1_1) {
                ws_js_1 = ws_js_1_1;
            }
        ],
        execute: function () {
            exports_6("h", h = (type, props, ...children) => type({ ...props, children: helpers_js_1.flat(children) }));
            exports_6("Fragment", Fragment = ({ children }) => ({ ch: helpers_js_1.flat(children) }));
            exports_6("canvas", canvas = document.getElementById("root"));
            exports_6("ctx", ctx = canvas.getContext("2d"));
            exports_6("mousePosition", mousePosition = { x: 0, y: 0 });
            exports_6("blink", blink = false);
            numRenders = 0;
            dom = [];
            rendering = false;
            clip = ({ x, y, w, h }) => {
                ctx.save();
                ctx.beginPath();
                ctx.rect(x, y, w, h);
                ctx.clip();
            };
            stroke = ({ x, y, w, h, c = 'red', bg = 'white' }) => {
                ctx.fillStyle = bg;
                ctx.fillRect(x, y, w, h);
                ctx.strokeStyle = c;
                ctx.strokeRect(x, y, w, h);
            };
            text = ({ t, fs, x, y, w, h, c = 'black' }) => {
                ctx.fillStyle = c;
                ctx.font = `${fs}px serif`;
                const fontHeight = ctx.measureText("M").width;
                ctx.fillText(t, x, y + fontHeight);
            };
            render = (node) => {
                console.log('render');
                dom.length = 0;
                var higherNodes = [node];
                var curZIndex = 1;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                let doStrokeAll = (node) => {
                    node.ch = typeof node.ch == 'function' ? node.ch(node) : node.ch;
                    if (node.zIndex > curZIndex) {
                        higherNodes.push(node);
                        return;
                    }
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
            };
            applyParenting = (node) => !node.parent
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
            exports_6("run", run = (root) => {
                let el = document.getElementsByTagName("html")[0];
                Object.assign(el.style, { margin: 0, padding: 0, overscrollBehavior: "none" });
                el = document.getElementsByTagName("body")[0];
                Object.assign(el.style, { margin: 0, padding: 0, overscrollBehavior: "none" });
                ws_js_1.wsInit();
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                ctx.translate(0.5, 0.5);
                console.log("App");
                console.log(root());
                render(root());
                console.log("dom");
                console.log(dom);
                exports_6("shouldRender", shouldRender = () => {
                    if (!rendering) {
                        window.requestAnimationFrame(() => {
                            render(root());
                            rendering = false;
                        });
                        rendering = true;
                    }
                });
                window.addEventListener("click", ({ offsetX: X, offsetY: Y }) => {
                    let done = false;
                    for (let node of dom.reverse()) {
                        const { x, y, w, h } = node;
                        if (X > x && X < x + w &&
                            Y > y && Y < y + h) {
                            if (node.onClick && !done) {
                                node.onClick();
                                done = true;
                            }
                        }
                        else {
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
                        if (X > el.x && X < el.x + el.w &&
                            Y > el.y && Y < el.y + el.h) {
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
                    exports_6("mousePosition", mousePosition = e);
                    dom.forEach((el) => {
                        el.onMouseMove && el.onMouseMove({ e, el }) && shouldRender();
                        el.onHover && el.onHover({ e, el }) && shouldRender();
                    });
                };
                var updatingMousePosition = false;
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
                    dom.forEach((el) => el.onAnimationFrame && el.onAnimationFrame({ el }) && shouldRender());
                    window.requestAnimationFrame(handleAnimationFrame);
                };
                window.requestAnimationFrame(handleAnimationFrame);
                window.setInterval(() => {
                    exports_6("blink", blink = !blink);
                    shouldRender();
                }, 500);
            });
        }
    };
});
System.register("components/textInput", ["jdom"], function (exports_7, context_7) {
    "use strict";
    var JDOM, TextInput, breakText, onTextInput;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (JDOM_1) {
                JDOM = JDOM_1;
            }
        ],
        execute: function () {
            exports_7("TextInput", TextInput = ({ state, style, children, }) => {
                let { active, cursorIndex, scroll, text } = state;
                text = text.length > 0 ? text : "enter text";
                let { x, y, w, h, fs } = style;
                JDOM.ctx.font = `${fs}px serif`;
                const { lines, curPos } = breakText({ w, fs, state, text });
                const fontHeight = JDOM.ctx.measureText("Mi").width;
                const textHeight = fontHeight * lines.length;
                const maxScroll = textHeight - h;
                return ({
                    clip: true,
                    onClick: () => {
                        state.active = !active;
                        cursorIndex = state.text.length;
                    },
                    x,
                    y,
                    w,
                    h,
                    c: active ? "green" : "yellow",
                    ch: ({ x, y, w, h }) => [{
                            x,
                            y: y + scroll,
                            w,
                            h,
                            ch: ({ x, y, w, h }) => [
                                ...lines.map((line, i) => ({
                                    x,
                                    y: y + (i * fontHeight),
                                    w,
                                    h,
                                    t: line,
                                    fs,
                                    ch: [],
                                })),
                                {
                                    t: active && JDOM.blink ? "\u258f" :
                                        "",
                                    x: x + JDOM.ctx.measureText(lines[curPos.y].substring(0, curPos.x)).width,
                                    y: y + curPos.y * fontHeight,
                                    ch: [],
                                },
                            ],
                        }],
                    onKeyPress: ({ e, el }) => {
                        if (active) {
                            onTextInput({ e, lines, curPos, state });
                            const newCurPos = breakText({ w, fs, state, text: state.text });
                            if ((newCurPos.curPos.y + 1) * fontHeight + state.scroll > h) {
                                state.scroll = Math.min(h - ((newCurPos.curPos.y + 1) * fontHeight), 0);
                            }
                            else if (newCurPos.curPos.y * fontHeight + state.scroll < 0) {
                                state.scroll = -newCurPos.curPos.y * fontHeight;
                            }
                            return true;
                        }
                        return false;
                    },
                    blur: () => {
                        state.active = false;
                        state.scroll = 0;
                    },
                    onWheel: ({ e: { clientX, clientY, deltaY }, el: { x, y, w, h } }) => {
                        if (maxScroll > 0 &&
                            clientX > x && clientX < (x + w) &&
                            clientY > y && clientY < (y + h)) {
                            state.scroll += deltaY;
                            state.scroll = Math.max(-maxScroll, Math.min(0, state.scroll));
                            return true;
                        }
                    },
                });
            });
            TextInput.init = (data) => ({
                text: "",
                cursorIndex: 0,
                scroll: 0,
                active: false,
                data,
            });
            breakText = ({ text, w, fs, state: { cursorIndex } }) => {
                JDOM.ctx.font = `${fs}px serif`;
                const t = Array.from(text);
                var line = "";
                var lines = [];
                for (let i = 0; i < t.length; i++) {
                    let c = t[i];
                    line += c;
                    if (c == "\n") {
                        lines.push(line);
                        line = "";
                    }
                    else if (JDOM.ctx.measureText(line).width >= w) {
                        lines.push(line.slice(0, line.length - 1));
                        line = line.slice(line.length - 1);
                    }
                }
                lines.push(line);
                let x = cursorIndex;
                let y = 0;
                for (let line of lines) {
                    if (line.length >= x && line[x - 1] != "\n") {
                        break;
                    }
                    else {
                        x -= line.length;
                        y++;
                    }
                }
                return ({ lines, curPos: { x, y } });
            };
            onTextInput = ({ e, lines, curPos: { x, y }, state }) => {
                let { cursorIndex, text } = state;
                let { key } = e;
                switch (key) {
                    case "Enter":
                        state.text = text.slice(0, cursorIndex) + "\n" + text.slice(cursorIndex);
                        state.cursorIndex++;
                        break;
                    case "Backspace":
                        if (cursorIndex > 0) {
                            state.text = text.slice(0, cursorIndex - 1) + text.slice(cursorIndex);
                            state.cursorIndex--;
                        }
                        break;
                    case "Delete":
                        state.text = text.slice(0, cursorIndex) + text.slice(cursorIndex + 1);
                        break;
                    case "ArrowUp":
                        if (y > 0 && !e.metaKey) {
                            state.cursorIndex -= (x + Math.max((lines[y - 1].length - x), 1));
                        }
                        else {
                            state.cursorIndex = 0;
                        }
                        break;
                    case "ArrowDown":
                        if (y < lines.length - 1 && !e.metaKey) {
                            state.cursorIndex += lines[y].length - x +
                                Math.min(x, (lines[y + 1].length - 1));
                        }
                        else {
                            state.cursorIndex = text.length;
                        }
                        break;
                    case "ArrowLeft":
                        if (e.metaKey) {
                            state.cursorIndex = lines.reduce((a, c, i) => i < y ? a + c.length : a, 0);
                        }
                        else {
                            state.cursorIndex = Math.max((cursorIndex - 1), 0);
                        }
                        break;
                    case "ArrowRight":
                        if (e.metaKey) {
                            state.cursorIndex = state.text.length -
                                lines.reduce((a, c, i) => i > y ? a + c.length : a, y == lines.length - 1 ? 0 : 1);
                        }
                        else {
                            state.cursorIndex = Math.min((cursorIndex + 1), text.length);
                        }
                        break;
                    case "Shift":
                        break;
                    case "Meta":
                        break;
                    default:
                        state.text = text.slice(0, cursorIndex) + key + text.slice(cursorIndex);
                        state.cursorIndex++;
                        break;
                }
            };
        }
    };
});
System.register("components/list", [], function (exports_8, context_8) {
    "use strict";
    var layoutAsList, List;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [],
        execute: function () {
            layoutAsList = ({ children, scroll, vertical, style }) => {
                const { x = 0, y = 0, w, h } = style;
                var ch = [];
                var offset = 0;
                for (let child of children) {
                    ch.push({
                        ...child,
                        x: vertical ? x : x + offset + scroll,
                        y: vertical ? y + offset + scroll : y,
                    });
                    offset += (vertical ? child.h : child.w);
                }
                return ({ ch, offset });
            };
            exports_8("List", List = ({ style, state, children = [], vertical = false }) => {
                let { offset } = layoutAsList({ children, scroll: state.scroll, vertical, style });
                let maxScroll = offset - (vertical ? style.h : style.w);
                return ({
                    ...style,
                    vertical,
                    ch: (style) => layoutAsList({ children, scroll: state.scroll, vertical, style }).ch,
                    offset,
                    clip: true,
                    onWheel: ({ e, el }) => {
                        let { clientX, clientY, deltaY, deltaX, timeStamp } = e;
                        let { x, y, w, h, vertical } = el;
                        if (clientX > x && clientX < (x + w) &&
                            clientY > y && clientY < (y + h)) {
                            if (timeStamp - state.lastScrollTime > 100) {
                                state.scrollVertical = Math.abs(deltaX) < Math.abs(deltaY);
                            }
                            state.lastScrollTime = timeStamp;
                            if (vertical == state.scrollVertical) {
                                state.scroll += (vertical ? deltaY : deltaX);
                                state.scroll = Math.max(-maxScroll, Math.min(0, state.scroll));
                                return true;
                            }
                        }
                        return false;
                    }
                });
            });
            List.init = () => ({
                scroll: 0,
                lastScrollTime: 0,
                scrollVertical: false
            });
        }
    };
});
System.register("components/slider", ["jdom"], function (exports_9, context_9) {
    "use strict";
    var JDOM, Slider;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (JDOM_2) {
                JDOM = JDOM_2;
            }
        ],
        execute: function () {
            exports_9("Slider", Slider = ({ style, state }) => {
                const { x, y, w, h } = style;
                const { offset, dragging, start, last } = state;
                const [hover, onHover] = JDOM.useHover({
                    x: x + offset,
                    y: y - (h / 2),
                    h,
                    w: h,
                });
                return ({
                    x, y, w, h,
                    ch: ({ x, y, w, h }) => [
                        { x, y, w, h: 1, c: 'red' },
                        {
                            x: x + (hover || dragging ? offset - 3 : offset),
                            y: y + (hover || dragging ? -(h / 2 + 3) : -(h / 2)),
                            h: hover || dragging ? h + 6 : h,
                            w: hover || dragging ? h + 6 : h,
                            c: 'green',
                            onHover,
                            onMouseDown: ({ e: { clientX } }) => {
                                state.dragging = true;
                                state.start = clientX;
                                return true;
                            },
                            onMouseUp: () => {
                                state.dragging = false;
                                state.last = offset;
                                return true;
                            },
                            onMouseMove: function ({ e: { x: mx } }) {
                                if (dragging) {
                                    state.offset = Math.max(0, Math.min(w - h, mx - start + last));
                                }
                                return dragging;
                            },
                        }
                    ],
                });
            });
            Slider.init = () => ({
                dragging: false,
                start: 0,
                offset: 0,
                last: 0
            });
        }
    };
});
System.register("components/dropDown", ["jdom"], function (exports_10, context_10) {
    "use strict";
    var JDOM, jdom_js_2, ddAnim, DropDown;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (JDOM_3) {
                JDOM = JDOM_3;
                jdom_js_2 = JDOM_3;
            }
        ],
        execute: function () {
            ddAnim = x => ({
                duration: 0.2,
                easing: 'quad',
                end: x
            });
            exports_10("DropDown", DropDown = ({ style, state, opts, prompt, children }) => {
                var { x, y, w, h } = style;
                var { val, index, open, height } = state;
                var options = open ? opts : [];
                var text = index == -1 ? prompt || 'select' : val;
                return ({
                    ...style,
                    ch: [{
                            ...style,
                            h: h + height.val,
                            c: open ? 'lightGrey' : 'black',
                            clip: true,
                            onAnimationFrame: () => state.height.active,
                            onClick: () => {
                                if (state.open) {
                                    state.height.to(ddAnim(0))
                                        .then(() => state.open = false);
                                }
                                else {
                                    state.open = true;
                                    state.height.to(ddAnim(opts.length * (h - 1)));
                                }
                            },
                            blur: () => state.open && state.height.to(ddAnim(0)).then(() => state.open = false),
                            ch: ({ x, y, w }) => [
                                ...options.map((t, i) => ({
                                    x: x + 1,
                                    y: y + (((i + 1) * h) - (1 + 1 * i) + 1),
                                    c: 'black',
                                    zIndex: 2,
                                    w: w - 2,
                                    h: h - 2,
                                    bg: 'white',
                                    ch: ({ x, y, w, h }) => [JDOM.h(jdom_js_2.Text, { center: true, t: t, style: { ...style, x, y, fs: 14 } })],
                                    onClick: () => {
                                        state.val = t,
                                            state.index = i;
                                        state.height.to(ddAnim(0)).then(() => state.open = false);
                                    },
                                })),
                                {
                                    x: w - 18,
                                    y: y + 8,
                                    t: open ? '\u1403' : '\u1401'
                                },
                                JDOM.h(jdom_js_2.Text, { center: true, t: text, style: { ...style, x, y, fs: 14 } }),
                            ]
                        }]
                });
            });
            DropDown.init = () => ({
                val: '',
                index: -1,
                open: false,
                height: JDOM.Animated(0)
            });
        }
    };
});
System.register("App", ["jdom", "components/textInput", "components/list", "components/slider", "components/dropDown"], function (exports_11, context_11) {
    "use strict";
    var JDOM, jdom_js_3, textInput_js_1, list_js_1, slider_js_1, dropDown_jsx_1, dragProps, state, Draggable, Card, Page, handleChildren, Row, Column, HoverText, App;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (JDOM_4) {
                JDOM = JDOM_4;
                jdom_js_3 = JDOM_4;
            },
            function (textInput_js_1_1) {
                textInput_js_1 = textInput_js_1_1;
            },
            function (list_js_1_1) {
                list_js_1 = list_js_1_1;
            },
            function (slider_js_1_1) {
                slider_js_1 = slider_js_1_1;
            },
            function (dropDown_jsx_1_1) {
                dropDown_jsx_1 = dropDown_jsx_1_1;
            }
        ],
        execute: function () {
            dragProps = () => ({
                last: { x: 0, y: 0 },
                start: { x: 0, y: 0 },
                dragging: false,
                x: 0,
                y: 0,
            });
            state = {
                draggables: [0].map((x) => ({
                    id: x,
                    ...dragProps(),
                })),
                textTest: [1, 2, 3].map((x) => textInput_js_1.TextInput.init(x)),
                words: ["and", "march", "rules", "real", "hard", "andy", "march", "rules", "real", "andy", "march", "rules", "real", "hard", "andy", "march", "rules", "real",],
                list: list_js_1.List.init(),
                list2: list_js_1.List.init(),
                list3: list_js_1.List.init(),
                list4: list_js_1.List.init(),
                page: { page: 0 },
                testSlider: slider_js_1.Slider.init(),
                anim: JDOM.Animated(100),
                drop: dropDown_jsx_1.DropDown.init()
            };
            Draggable = ({ props, children }) => {
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
            Card = ({ style: { w = 0, h = 0, t = "", pad = 0, fs = 12, x = 0, y = 0, c, zIndex = 1 }, onClick, onAnimationFrame }) => ({
                x,
                y,
                w,
                h,
                c,
                zIndex,
                onClick,
                onAnimationFrame,
                ch: ({ x, y, w, h }) => [
                    JDOM.h(HoverText, { center: true, t: t, style: {
                            x: x + pad,
                            y: y + pad,
                            w: w - pad * 2,
                            h: h - pad * 2,
                            c: "red",
                            fs,
                            r: 5,
                        } }),
                ],
            });
            Page = ({ state, page, children }) => ({
                ch: state.page == page ? children : [],
                x: 0,
                y: 0,
                w: 0,
                h: 0,
            });
            handleChildren = ({ children, vertical, style }) => {
                const { spread, fill } = style;
                const totalChildrenWidth = children.reduce((a, c) => a + (vertical ? c.h : c.w), 0);
                const extraWidth = (vertical ? style.h : style.w) - totalChildrenWidth;
                const extraWidthPer = extraWidth / children.length;
                var ch = children;
                if (spread) {
                    var offset = 0;
                    var newCh = [];
                    ch.forEach(child => {
                        const { x, y, w, h } = child;
                        const rx = style.x + x + offset + extraWidthPer / 2;
                        const ry = style.y + y + offset + extraWidthPer / 2;
                        offset += (vertical ? y : x) + extraWidthPer + (vertical ? h : w) + 1;
                        newCh.push({
                            ...child,
                            y: vertical ? ry : y + style.y,
                            x: vertical ? x + style.x : rx,
                        });
                    });
                    ch = newCh;
                }
                else if (fill) {
                    var offset = 0;
                    var newCh = [];
                    children.forEach(child => {
                        const { x, y, w, h } = child;
                        const rx = style.x + offset;
                        const ry = style.y + offset;
                        offset += (vertical ? h : w) + extraWidthPer + 1;
                        newCh.push({
                            ...child,
                            x: vertical ? style.x + x : rx,
                            y: vertical ? ry : style.y + y,
                            w: vertical ? style.w : w + extraWidthPer,
                            h: vertical ? h + extraWidthPer : style.h,
                        });
                    });
                    ch = newCh;
                }
                else {
                    var offset = 0;
                    var newCh = [];
                    children.forEach(child => {
                        const { x, y, w, h } = child;
                        const rx = style.x + offset;
                        const ry = style.y + offset;
                        offset += (vertical ? h : w) + 1;
                        newCh.push({
                            ...child,
                            x: vertical ? style.x + x : rx,
                            y: vertical ? ry : style.y + y,
                        });
                    });
                    ch = newCh;
                }
                return ch;
            };
            Row = ({ style, vertical, children }) => {
                return ({
                    ...style,
                    ch: (style) => handleChildren({ children, style, vertical: false })
                });
            };
            Column = ({ style, vertical, children }) => {
                return ({
                    ...style,
                    ch: handleChildren({ children, style, vertical: true })
                });
            };
            HoverText = ({ style, t, center }) => {
                return ({
                    ...style,
                    ch: (style) => {
                        const [hover, onHover] = JDOM.useHover(style);
                        return ([
                            JDOM.h(jdom_js_3.Text, { center: center, t: t, style: { ...style, c: hover ? 'red' : 'blue', w: hover ? style.w + 20 : style.w }, onHover: onHover })
                        ]);
                    }
                });
            };
            App = () => JDOM.h(JDOM.Fragment, null,
                JDOM.h(slider_js_1.Slider, { style: { x: 10, y: 200, w: 200, h: 18 }, state: state.testSlider }),
                JDOM.h(list_js_1.List, { style: { x: 100, y: 10, w: 530, h: 120, c: "green" }, state: state.list, vertical: true },
                    JDOM.h(list_js_1.List, { style: { w: 530, h: 60, c: "red" }, state: state.list2 }, state.words.map((word) => JDOM.h(Card, { style: { w: 60, h: 50, pad: 5, fs: 14, t: word } }))),
                    JDOM.h(list_js_1.List, { style: { w: 530, h: 60, c: "blue" }, state: state.list3 }, state.words.map((word) => JDOM.h(Card, { style: { w: 60, h: 50, pad: 5, fs: 14, t: word } }))),
                    JDOM.h(list_js_1.List, { style: { w: 530, h: 60, c: "blue" }, state: state.list4 },
                        state.words.map((word) => JDOM.h(Card, { style: { w: 60, h: 50, pad: 5, fs: 14, t: word } })),
                        JDOM.h(textInput_js_1.TextInput, { state: state.textTest[0], style: { x: 0, y: 0, w: 100, h: 30, fs: 14 } }))),
                JDOM.h(Card, { style: { w: state.anim.val, h: 100, x: 10, y: 300, t: 'anim', fs: 12, zIndex: 3 }, onClick: () => state.anim.to({ end: state.anim.val == 100 ? 400 : 100, duration: 1, easing: 'quad' })
                        .then(() => state.anim.to({ end: state.anim.val == 100 ? 400 : 100, duration: 1, easing: 'quad' }))
                        .then(() => state.anim.to({ end: state.anim.val == 100 ? 400 : 100, duration: 1, easing: 'quad' }))
                        .then(() => state.anim.to({ end: state.anim.val == 100 ? 400 : 100, duration: 1, easing: 'quad' })), onAnimationFrame: () => state.anim.active }),
                JDOM.h(dropDown_jsx_1.DropDown, { state: state.drop, style: { x: 200, y: 300, w: 100, h: 30, }, opts: ['one', 'two', 'three'] }),
                JDOM.h(Row, { style: { x: 10, y: 450, w: 800, h: 60, c: 'red', fill: true } },
                    JDOM.h(HoverText, { style: { x: 0, y: 0, w: 60, h: 20, fs: 14, c: 'blue' }, center: true, t: 'test' }),
                    JDOM.h(jdom_js_3.Text, { style: { x: 0, y: 0, w: 30, h: 20, fs: 14, c: 'green' }, center: true, t: 'test2' }),
                    JDOM.h(jdom_js_3.Text, { style: { x: 0, y: 0, w: 30, h: 20, fs: 14, c: 'purple' }, center: true, t: 'test3' }),
                    JDOM.h(jdom_js_3.Text, { style: { x: 0, y: 0, w: 30, h: 20, fs: 14, c: 'gold' }, center: true, t: 'test4' })));
            JDOM.run(App);
        }
    };
});

__instantiate("App", false);
