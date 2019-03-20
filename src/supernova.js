const SLIDES = {
  1: [0, 3000],
  2: [3000, 5500],
  3: [5500, 15000],
  4: [15000, 19000],
  5: [19000, 20500]
};

const reset = () => {
  KeyshapeJS.globalPause();
  KeyshapeJS.timelines()[0].time(0);
};

let pauseTimeout = null;

const playSlide = index => {
  const slide = SLIDES[index];

  if (!slide) {
    return;
  }

  clearTimeout(pauseTimeout);

  KeyshapeJS.timelines()[0].time(slide[0]);
  KeyshapeJS.globalPlay();

  pauseTimeout = setTimeout(() => {
    KeyshapeJS.globalPause();
  }, slide[1] - slide[0]);
};

const handleEvent = event => {
  const { type, data } = event.data;

  switch (type) {
    case 'reset':
      reset();
      break;
    case 'slide':
      playSlide(data);
      break;
    default:
      break;
  }
};

window.addEventListener('message', handleEvent);

// Wait at the start
reset();
