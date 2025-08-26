const ns = 'arcade:';
const pauseListeners = [];
const resumeListeners = [];

export const services = {
  storage: {
    get(key, def) {
      try {
        const v = localStorage.getItem(ns + key);
        return v ? JSON.parse(v) : def;
      } catch (e) {
        return def;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(ns + key, JSON.stringify(val));
      } catch (e) {}
    },
  },
  audio: {
    play(name) {
      console.log('audio.play', name);
    },
  },
  haptics: { light() {}, medium() {}, heavy() {} },
  lifecycle: {
    onPause(cb) { pauseListeners.push(cb); },
    onResume(cb) { resumeListeners.push(cb); },
  },
};

document.addEventListener('visibilitychange', () => {
  const list = document.hidden ? pauseListeners : resumeListeners;
  list.forEach((cb) => cb());
});
