import Promise from 'bluebird';
const Element = {
  setAttrs($tag, attrs = {}) {
    if (attrs.classNames) {
      if (typeof attrs.classNames === "string") {
        attrs.classNames = [attrs.classNames];
      }
      attrs.class = attrs.classNames.join(" ");
      delete attrs.classNames;
    }

    Object.keys(attrs).forEach((key) => {
      $tag.attr(key, attrs[key]);
    })
  },
  setChildren($tag, children) {
    if (!children) {
      return;
    }
    const childElements = children.map((child) => {
      return this.create(child);
    })
    $tag.html(childElements);
  },
  create(conf) {
    const $tag = $("<" + conf.tag + ">");
    this.setAttrs($tag, conf.attrs);
    this.setChildren($tag, conf.children);
    return $tag;
  }
}
const PromiseCatch = function(err) {
  if (err instanceof Promise.TimeoutError) {
    console.warn("fn is not fulfilled in 10 seconds", err);
  } else {
    console.error(err);
    throw err;
  }
}
Promise.prototype.execFn = function(fn, sync = false) {
  return this.then((response) => {
    if (sync) {
      fn(response);
      return this;
    }
    return new Promise((resolve, reject) => {
      fn(response, resolve, reject);
    }).timeout(10000).catch(PromiseCatch)
  })
}
const TestHelper = {
  execFn(fn, sync = false) {
    if (sync) {
      fn();
      return this;
    }
    return new Promise((resolve, reject) => {
      fn(null, resolve, reject);
    }).timeout(10000).catch(PromiseCatch)
  },
  addDivToBody(conf = {}) {
    conf.tag = "div";
    const $ele = Element.create(conf);
    $(document.body).append($ele);
    return $ele[0];
  },
  delay(time) {
    return Promise.delay(time);
  },
  createElement(conf = {}, target) {
    if (!target) {
      console.warn("Target is not defined.");
      return;
    }
    if (typeof target === "string" || target instanceof String) {
      target = $(target)[0];
    }
    if (!(target instanceof HTMLElement)) {
      console.warn("target should be an HTMLElement, or a jquery selector.");
      return;
    }

    if (typeof conf.tag !== "string") {
      console.error("html tag should be defined");
      return;
    }
    const $ele = Element.create(conf)
    $(target).html($ele);
    return $ele[0];
  },
  clean() {
    $("body > div").remove()
  }
}
export default TestHelper