import * as JDOM from "../jdom.js";

export const TextInput = ({
  state,
  style,
  children,
}) => {
  let { active, cursorIndex, scroll, text } = state;
  text = text.length > 0 ? text : "enter text";
  let { x, y, w, h, fs } = style;
  JDOM.ctx.font = `${fs}px serif`;
  const { lines, curPos } = breakText({ w, fs, state, text });
  const fontHeight = JDOM.ctx.measureText("Mi").width;
  const textHeight = fontHeight * lines.length;
  const maxScroll = textHeight - h;
  return ({
    // parent: true,
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
    ch:({x,y,w,h}) => [{
      x,
      y: y + scroll,
      w,
      h,
      // parent: true,
      // clip:true,
      ch: ({x,y,w,h})=>[
        ...lines.map((line, i) => ({
          x,
          y: y+(i * fontHeight),
          w,
          h,
          t: line,
          fs,
          ch: [],
        })),
        //draw the cursor
        {
          t: active && JDOM.blink ? "\u258f" : // '\u23b8'
            "",
          x: x + JDOM.ctx.measureText(lines[curPos.y].substring(0, curPos.x)).width,
          y: y + curPos.y * fontHeight,
          // fs:10,
          ch: [],
        },
      ],
    }],
    onKeyPress: ({ e, el }) => {
      if (active) {
        onTextInput({ e, lines, curPos, state });
        const newCurPos = breakText({ w, fs, state, text: state.text });
        if ((newCurPos.curPos.y + 1) * fontHeight + state.scroll > h) {
          // console.log('below')
          state.scroll = Math.min(
            h - ((newCurPos.curPos.y + 1) * fontHeight),
            0,
          );
        } else if (newCurPos.curPos.y * fontHeight + state.scroll < 0) {
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
      if (
        maxScroll > 0 &&
        clientX > x && clientX < (x + w) &&
        clientY > y && clientY < (y + h)
      ) {
        state.scroll += deltaY;
        state.scroll = Math.max(-maxScroll, Math.min(0, state.scroll));
        return true;
      }
    },
  });
};

TextInput.init = (data) => ({
  text: "",
  cursorIndex: 0,
  scroll: 0,
  active: false,
  data,
});

const breakText = ({ text, w, fs, state: { cursorIndex } }) => {
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
    } else if (JDOM.ctx.measureText(line).width >= w) {
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
    } else {
      x -= line.length;
      y++;
    }
  }
  return ({ lines, curPos: { x, y } });
};

const onTextInput = ({ e, lines, curPos: { x, y }, state }) => {
  // console.log(e)
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
      } else {
        state.cursorIndex = 0;
      }
      break;
    case "ArrowDown":
      if (y < lines.length - 1 && !e.metaKey) {
        state.cursorIndex += lines[y].length - x +
          Math.min(x, (lines[y + 1].length - 1));
      } else {
        state.cursorIndex = text.length;
      }
      break;
    case "ArrowLeft":
      if (e.metaKey) {
        state.cursorIndex = lines.reduce(
          (a, c, i) => i < y ? a + c.length : a,
          0,
        );
      } else {
        state.cursorIndex = Math.max((cursorIndex - 1), 0);
      }
      break;
    case "ArrowRight":
      if (e.metaKey) {
        state.cursorIndex = state.text.length -
          lines.reduce(
            (a, c, i) => i > y ? a + c.length : a,
            y == lines.length - 1 ? 0 : 1,
          );
      } else {
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
