export function on(element, event, handler) {
  if (element && event && handler) {
    element.addEventListener(event, handler, false);
  }
}

export function off(element, event, handler) {
  if (element && event && handler) {
    element.removeEventListener(event, handler, false);
  }
}

export function once(el, event, fn) {
  const listener = function (...args) {
    if (fn) {
      fn.apply(this, args);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
}
