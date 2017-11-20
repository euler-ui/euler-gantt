import TestHelper from './TestHelper';
import Promise from 'bluebird';
const drag = function(element, dx, dy, cb) {
  // calculate positions
  const pos = element.getBoundingClientRect();
  const center1X = Math.floor((pos.left + pos.right) / 2);
  const center1Y = Math.floor((pos.top + pos.bottom) / 2);
  const center2X = center1X + dx;
  const center2Y = center1X + dy;
  simulate(element, 'mousedown', {
    pointerX: center1X,
    pointerY: center1Y
  });
  return TestHelper.delay(800).then(() => {
    simulate(element, 'dragstart', {
      pointerX: center1X,
      pointerY: center1Y,
      button: 1
    });
    simulate(element, 'drag', {
      pointerX: center1X,
      pointerY: center1Y,
      button: 1
    });
    simulate(element, 'mousemove', {
      pointerX: center2X,
      pointerY: center2Y,
      button: 1
    });
    simulate(document.body, 'drop', {
      pointerX: center2X,
      pointerY: center2Y,
      button: 1
    });
    simulate(element, 'dragend', {
      pointerX: center2X,
      pointerY: center2Y,
      button: 1
    });
    simulate(element, 'mouseup', {
      pointerX: center2X,
      pointerY: center2Y,
      button: 1
    });
    cb && cb();
  });
};

function simulate(element, eventName) {
  const options = extend(defaultOptions, arguments[2] || {});
  let oEvent,
    eventType = null;

  for (let name in eventMatchers) {
    if (eventMatchers[name].test(eventName)) {
      eventType = name;
      break;
    }
  }

  if (!eventType) {
    throw 'Only HTMLEvents and MouseEvents interfaces are supported';
  }

  // if (document.createEvent) {
  oEvent = document.createEvent(eventType);
  if (eventType == 'HTMLEvents') {
    oEvent.initEvent(eventName, options.bubbles, options.cancelable);
  } else {
    oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
      options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
      options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
  }
  element.dispatchEvent(oEvent);
  // } else {
  //   options.clientX = options.pointerX;
  //   options.clientY = options.pointerY;
  //   const evt = document.createEventObject();
  //   oEvent = extend(evt, options);
  //   element.fireEvent('on' + eventName, oEvent);
  // }
  return element;
}

function extend(destination, source) {
  for (let property in source) {
    destination[property] = source[property];
  }
  return destination;
}

const eventMatchers = {
  'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
  'MouseEvents': /^(?:click|dblclick|drag|drop|dragstart|dragend|mouse(?:down|up|over|move|out))$/
}
const defaultOptions = {
  pointerX: 0,
  pointerY: 0,
  button: 0,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  bubbles: true,
  cancelable: true
}

export default {
  simulate: simulate,
  drag: drag
}
