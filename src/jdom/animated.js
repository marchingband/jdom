const easings = {
    quad: (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
    sin: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  };
  
  export const Animated = (init) => {
    var anim = {
      val: init,
      start: init,
      startTime: 0,
      init: init,
      active: false,
      progress: 0,
      to: ({ end, duration = 1, easing = "sin" }) =>
        new Promise((res, rej) => {
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
            } else {
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
  };
  