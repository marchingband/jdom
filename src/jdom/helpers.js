export const flat = (a) => {
    let out = [];
    a.forEach((x) => {
      if (x.length) {
        out = [...out, ...x];
      } else {
        out.push(x);
      }
    });
    return out;
  };
  