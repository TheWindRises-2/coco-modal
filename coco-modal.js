"use strict";

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }

  return _typeof(obj);
}

!(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ===
    "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global = global || self), (global.coco = factory()));
})(void 0, function () {
  "use strict";

  var initOptions = {
    visible: false,
    maskClose: true,
    header: true,
    footer: true,
    title: "提示",
    text: "",
    width: "",
    top: "",
    inputAttrs: false,
    escClose: true,
    okButton: true,
    cancelButton: true,
    okText: "确定",
    cancelText: "取消",
    closeButton: true,
    zIndexOfModal: 1995,
    zIndexOfMask: 2008,
    zIndexOfActiveModal: 2020,
    autoFocusOkButton: true,
    autoFocusInput: true,
    fullScreen: false,
    borderRadius: "",
    blur: false,
    buttonColor: "",
    hooks: {},
    destroy: false,
    animation: true,
    onClose: null,
  };
  var w = window;
  var doc = null;
  var body = null;
  var docEl = null;
  var scrollbarWidth = 0;
  var bodyStyle = {};
  var inBrowser = typeof w !== "undefined";

  var isAnimation = function isAnimation(anm) {
    return ieVersion() > 9 ? anm : false;
  };

  function getRaf() {
    var res, has;
    ["r", "webkitR", "mozR", "msR", "O"].forEach(function (prefix) {
      var name = prefix + "equestAnimationFrame";
      if (name in w && !has) {
        res = w[name];
        has = true;
      }
    });
    return res;
  }

  var raf = inBrowser
    ? getRaf()
      ? getRaf().bind(w)
      : setTimeout
    : function (fn) {
        return fn();
      };

  function ieVersion() {
    var userAgent = navigator.userAgent;
    var isIE =
      userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE;
    var isIE11 =
      userAgent.indexOf("Trident") > -1 && userAgent.indexOf("rv:11.0") > -1;

    if (isIE) {
      var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
      reIE.test(userAgent);
      var fIEVersion = parseFloat(RegExp["$1"]);

      if (fIEVersion == 7) {
        return 7;
      } else if (fIEVersion == 8) {
        return 8;
      } else if (fIEVersion == 9) {
        return 9;
      } else if (fIEVersion == 10) {
        return 10;
      } else {
        return 6;
      }
    } else if (isEdge) {
      return "edge";
    } else if (isIE11) {
      return 11;
    } else {
      return 100;
    }
  }

  function nowTime() {
    return Date.now();
  }

  function rafTimeout(fn, time) {
    var now = nowTime();
    var res = {
      stop: false,
    };

    function step() {
      if (nowTime() - now < time) {
        raf(step);
      } else {
        !res.stop && fn();
      }
    }

    raf(step);
    return res;
  }

  var cancelRaf = function cancelRaf(res) {
    if (res) res.stop = true;
  };

  rafTimeout = w.requestAnimationFrame ? rafTimeout : w.setTimeout;
  var MousePos = {};
  var clickTime = 0;
  var keyDownTime = 0;

  function setPointerPosition(e) {
    MousePos.x = e.clientX;
    MousePos.y = e.clientY;
    clickTime = nowTime();
  }

  function beforeClose(a, way) {
    var isOk = way == "ok";
    a.closeType = way;
    var aa = Object.assign({}, a);

    if (a.isLoading && way == "ok") {
      return;
    }

    if (a.beforeCloseFn) {
      if (a.beforeCloseFn.length < 2) {
        a.beforeCloseFn(isOk);
        closeModal(a);
      } else if (a.beforeCloseFn.length === 2) {
        a.beforeCloseFn(isOk, aa);
        closeModal(a);
      } else {
        a.beforeCloseFn(isOk, aa, function () {
          closeModal(a);
        });
      }
    } else {
      closeModal(a);
    }
  }

  function addSomeEvents() {
    addEvent(docEl, "click", setPointerPosition, true);
    addEvent(
      w,
      "keydown",
      function () {
        keyDownTime = nowTime();
      },
      true
    );
    addEvent(w, "keyup", function (e) {
      var l = wrapperArray.length;

      if (e.code === "Escape" && l) {
        var a = wrapperArray[l - 1];

        if (a.escClose) {
          if (a.$el) {
            a.close("esc");
          } else {
            beforeClose(a, "esc");
          }
        }
      }
    });
    addEvent(w, "resize", function () {
      var modal = null;
      wrapperArray.forEach(function (md) {
        modal = md.modal;
        setTransformOrigin(modal);
      });
    });
  }

  function addClass(el, s) {
    var c = el.className || "";

    if (!hasClass(c, s)) {
      var arr = c.split(/\s+/);
      arr.push(s);
      el.className = arr.join(" ");
    }
  }

  function hasClass(c, s) {
    return c.indexOf(s) > -1 ? !0 : !1;
  }

  function removeClass(el, s) {
    var c = el.className || "";

    if (hasClass(c, s)) {
      var arr = c.split(/\s+/);
      var i = arr.indexOf(s);
      arr.splice(i, 1);
      el.className = arr.join(" ");
    }

    if (el.getAttribute("class") === "") {
      el.removeAttribute("class");
    }
  }

  function addEvent(el, name, fn, c) {
    el.addEventListener(name, fn, c);
  }

  function getStyle(el, value) {
    if (w.getComputedStyle) {
      return getComputedStyle(el)[value];
    } else {
      return el.currentStyle[value];
    }
  }

  function isHideScrollbar() {
    body.scrollHeight > window.CocoMask.offsetHeight &&
      getStyle(body, "overflowY") !== "hidden" &&
      hideBodyBar(window.CocoMask.offsetWidth);
  }

  function hideBodyBar(windowWidth) {
    var width = getStyle(body, "width");
    var bodyWidth = body.style.width;
    var bodyOverflow = body.style.overflow;
    var bodyPosition = body.style.position;
    bodyStyle.position = bodyPosition;
    bodyStyle.overflow = bodyOverflow;
    bodyStyle.width = bodyWidth;
    width =
      windowWidth < parseFloat(width)
        ? width
        : "calc(100% - ".concat(scrollbarWidth, "px)");
    css(body, {
      position: bodyPosition === "" ? "relative" : bodyPosition,
      overflow: "hidden",
      width: width,
    });
  }

  function deleteBodyStyle() {
    css(body, {
      position: bodyStyle.position,
      overflow: bodyStyle.overflow === "visible" ? "" : bodyStyle.overflow,
      width: bodyStyle.width,
    });
  }

  function getBarWidth() {
    var d = doc.createElement("div"),
      d1 = doc.createElement("div"),
      w1 = 0,
      w2 = 0;
    d.style.width = "1000px";
    d.style.position = "fixed";
    d.style.top = "100%";
    d.style.overflow = "scroll";
    d1.style.width = "100%";
    d.appendChild(d1);
    body.appendChild(d);
    w1 = d.offsetWidth;
    w2 = d1.offsetWidth;
    removeChildNode(d);
    return w1 - w2;
  }

  var r = function r(node) {
    var children =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var el = node.el;
    el = doc.createElement(node.el || "div");
    delete node.el;

    for (var key in node) {
      if (key === "is") {
        var arr = node[key];
        arr[0][arr[1]] = el;
        continue;
      }

      if (node.hasOwnProperty(key)) {
        var val = node[key];

        if (key[0] === "@") {
          var name = key.slice(1);
          addEvent(el, name, val);
        } else {
          el.setAttribute(key, val);
        }
      }
    }

    if (_typeof(children) === "object") {
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        el.appendChild(child);
      }
    }

    return el;
  };

  function css(el, css) {
    for (var key in css) {
      el.style[key] = css[key];
    }

    if (el.getAttribute("style") === "") {
      el.removeAttribute("style");
    }
  }

  function showMask(a) {
    if (window.CocoMask) return;
    window.CocoMask = r({
      class: "coco-modal-mask blur",
      "@click": function click() {
        if (
          (typeof process === "undefined" ? "undefined" : _typeof(process)) !==
          undefined
        ) {
          removeChildNode(window.CocoMask);
          window.CocoMask = null;
          wrapperArray = [];
          deleteBodyStyle();
        }
      },
    });
    a.mask = window.CocoMask;
    body.appendChild(window.CocoMask);
  }

  var wrapperArray = [];

  function blurModal() {
    var l = wrapperArray.length;

    if (l) {
      var a = wrapperArray[l - 1] && wrapperArray[l - 1];
      a.inputEl && a.inputEl.blur();
      a.okButtonEl && a.okButtonEl.blur();
    }
  }

  var modalElID = {};

  function initModal(a) {
    var wrapper = a.wrapper,
      modal = a.modal,
      okButtonEl = a.okButtonEl,
      destroy = a.destroy,
      el = a.el,
      inputAttrs = a.inputAttrs;
    initModalData(a);
    needRender(a);
    addEvent(wrapper, "scroll", function (_) {
      scrollOrigin(a, wrapper, modal);
    });

    if (inputAttrs) {
      initInput(a);
    }

    addEvent(okButtonEl, "keyup", function (e) {
      if (e.code === "Enter") {
        beforeClose(a, "ok");
      }
    });

    if (el) {
      var elm = modalElID[el];

      if (!elm) {
        try {
          if (el.tagName === undefined) {
            elm = doc.querySelector(el);
          } else {
            elm = el;
          }
        } catch (error) {
          throw new Error(error);
        }

        modalElID[el] = elm;
      }

      if (destroy) {
        elm = elm.cloneNode(true);
      }

      css(elm, {
        display: "",
      });
      a.domEl.appendChild(elm);
    }

    var div = r({});
    a.div = div;
    div.appendChild(wrapper);
    body.appendChild(div);
    css(wrapper, {
      display: "none",
    });
    showModal(a);
  }

  var cocoFocusEl = null;

  function scrollOrigin(a, wrapper, modal) {
    var offsetX = wrapper.scrollLeft - a.scrollLeft;
    var offsetY = wrapper.scrollTop - a.scrollTop;
    var x = a.originX + offsetX;
    var y = a.originY + offsetY;
    var origin = x + "px " + y + "px";
    setTransformOrigin(modal, origin);
  }

  function displayModal(wrapper) {
    css(wrapper, {
      display: "",
    });
    css(window.CocoMask, {
      display: "",
    });
  }

  function isBlur(blur, modalContent) {
    if (blur) {
      addClass(window.CocoMask, "blur");
      addClass(modalContent, "coco-no-shadow");
    } else {
      window.CocoMask && removeClass(window.CocoMask, "blur");
      modalContent && removeClass(modalContent, "coco-no-shadow");
    }
  }

  function addModal(a) {
    wrapperArray.push(a);
  }

  function startAnimation(el, name, type) {
    type = type ? "enter" : "leave";
    addClass(el, name + "-" + type);
    addClass(el, name + "-" + type + "-active");
  }

  function clearClass(el, name, type) {
    type = type ? "enter" : "leave";
    removeClass(el, name + "-" + type);
    removeClass(el, name + "-" + type + "-" + "active");
  }

  function setModalZIndex(a) {
    var wrapper = a.wrapper,
      zIndexOfMask = a.zIndexOfMask,
      zIndexOfActiveModal = a.zIndexOfActiveModal;
    css(wrapper, {
      zIndex: zIndexOfActiveModal,
    });
    css(window.CocoMask, {
      zIndex: zIndexOfMask,
    });
  }

  function showModal(a) {
    var wrapper = a.wrapper,
      modal = a.modal,
      blur = a.blur,
      modalContent = a.modalContent,
      animation = a.animation,
      onMount = a.onMount,
      notMount = a.notMount,
      fullScreen = a.fullScreen,
      hooks = a.hooks,
      inputAttrs = a.inputAttrs;

    if (!wrapper) {
      return;
    }

    removeClass(wrapper, "coco-p-e-n");

    if (!doc) {
      doc = w.document;
      body = doc.body;
      docEl = doc.documentElement;
    }

    !a.isOpen && clearClose(a);
    var duration = isAnimation(animation) ? 380 : 0;
    a.isOpen = true;
    cocoFocusEl = doc.activeElement;
    showMask(a);
    setModalZIndex(a);
    isBlur(blur, modalContent);
    blurModal();
    addModal(a);
    wrapperArray.length > 1 && resetModalIndex();
    displayModal(wrapper);
    isHideScrollbar();
    a.scrollTop = wrapper.scrollTop;
    a.scrollLeft = wrapper.scrollLeft;

    if (wrapperArray.length === 1) {
      animation && startAnimation(window.CocoMask, "fade", true);
    }

    if (inputAttrs) {
      a.inputValue = a.inputEl.value || "";
    }

    fullScreen && fullScreenModal(a);
    paddingBottom(modal, modalContent);
    positionCenter(a);
    animation && isOrigin(a, modal);
    animation && startAnimation(modal, "zoom", true);
    notMount && onMount && onMount(a);
    a.notMount = false;
    hooks && hooks.open && hooks.open(a);
    isFocusEl(modal);
    a.rafTimerOpen = rafTimeout(function () {
      clearClass(modal, "zoom", true);
      clearClass(window.CocoMask, "fade", true);
      hooks && hooks.opened && hooks.opened(a);
    }, duration);
  }

  function clearOpen(a) {
    cancelRaf(a.rafTimerOpen);
    clearClass(a.modal, "zoom", true);
    clearClass(window.CocoMask, "fade", true);
  }

  function closeModal(a) {
    var _a = a,
      wrapper = _a.wrapper,
      modal = _a.modal,
      isOpen = _a.isOpen,
      destroy = _a.destroy,
      div = _a.div,
      animation = _a.animation,
      args = _a.args,
      hooks = _a.hooks,
      $el = _a.$el;

    if (!wrapper) {
      return;
    }

    var duration = isAnimation(animation) ? 280 : 0;
    isOpen && clearOpen(a);
    a.isOpen = false;
    addClass(wrapper, "coco-p-e-n");
    deleteArrayItems(a, wrapperArray);
    animation && startAnimation(modal, "zoom");

    if (!wrapperArray.length) {
      animation && startAnimation(window.CocoMask, "fade");
    }

    hooks && hooks.close && hooks.close(a);
    a.rafTimerClose = rafTimeout(function () {
      wrapperArray.length > 0 && resetModalIndex();
      clearClass(modal, "zoom");
      clearClass(window.CocoMask, "fade");

      if (!wrapperArray.length) {
        if (destroy) {
          body.contains(window.CocoMask) && removeChildNode(window.CocoMask);
          window.CocoMask = null;
        } else {
          css(window.CocoMask, {
            display: "none",
          });
        }

        deleteBodyStyle();
      } // cocoFocusEl && cocoFocusEl.focus();

      hooks && hooks.closed && hooks.closed(a);

      if (destroy && !$el) {
        body.contains(div) && removeChildNode(div);
        deleteArrayItems(
          {
            a: a,
            args: args,
          },
          CocoArgsArray,
          true
        );

        for (var key in a) {
          if (a.hasOwnProperty(key)) {
            a[key] = null;
            delete a[key];
          }
        }

        a = null;
      } else {
        css(wrapper, {
          display: "none",
        });
      }
    }, duration);
  }

  function clearClose(a) {
    var _a2 = a,
      modal = _a2.modal,
      destroy = _a2.destroy,
      $el = _a2.$el,
      args = _a2.args,
      div = _a2.div;

    if (!window.CocoMask) {
      return;
    }

    cancelRaf(a.rafTimerClose);
    wrapperArray.length > 0 && resetModalIndex();
    clearClass(modal, "zoom");
    clearClass(window.CocoMask, "fade");

    if (!wrapperArray.length) {
      if (destroy) {
        body.contains(window.CocoMask) && removeChildNode(window.CocoMask);
        window.CocoMask = null;
      } else {
        css(window.CocoMask, {
          display: "none",
        });
      }

      deleteBodyStyle();
    }

    cocoFocusEl && cocoFocusEl.focus();

    if (destroy && !$el) {
      body.contains(div) && removeChildNode(div);
      deleteArrayItems(
        {
          a: a,
          args: args,
        },
        CocoArgsArray,
        true
      );

      for (var key in a) {
        if (a.hasOwnProperty(key)) {
          a[key] = null;
          delete a[key];
        }
      }

      a = null;
    }
  }

  function paddingBottom(modal, modalContent) {
    var needPaddingBottom =
      modalContent.offsetHeight + modalContent.offsetTop >
      window.CocoMask.offsetHeight;

    if (needPaddingBottom) {
      css(modal, {
        paddingBottom: "30px",
      });
    }
  }

  function isFocusEl(modal) {
    if (
      modal.offsetHeight <= window.CocoMask.offsetHeight &&
      modal.offsetWidth <= window.CocoMask.offsetWidth
    ) {
      focusEl();
    }
  }

  function deleteArrayItems(item, arr, args) {
    var i = 0;

    if (args) {
      arr.forEach(function (it, index) {
        if (it.a === item.a) {
          i = index;
          arr.splice(i, 1);
        }
      });
    } else {
      arr.forEach(function (it, index) {
        if (it === item) {
          i = index;
          arr.splice(i, 1);
        }
      });
    }

    return i;
  }

  function setTransformOrigin(node, value) {
    var style = node.style;
    value = value ? value : "";
    ["t", "webkitT", "MozT", "msT", "OT"].forEach(function (prefix) {
      if (prefix + "ransformOrigin" in style)
        style[prefix + "ransformOrigin"] = value;
    });
  }

  function pos(el) {
    var rect = el.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
    };
  }

  function isOrigin(a, modal) {
    var isClick = nowTime() - clickTime < 120;
    var notKeyDown = Math.abs(clickTime - keyDownTime) >= 60;

    if (isClick && notKeyDown) {
      var _pos = pos(modal),
        left = _pos.left,
        top = _pos.top;

      var x = MousePos.x - left;
      var y = MousePos.y - top;
      var origin = x + "px " + y + "px";
      a.originX = x;
      a.originY = y;
      setTransformOrigin(modal, origin);
    } else {
      setTransformOrigin(modal);
    }
  }

  function positionCenter(_ref) {
    var top = _ref.top,
      modal = _ref.modal,
      fullScreen = _ref.fullScreen;

    if (top === "center") {
      var windowHeight = window.CocoMask.offsetHeight;
      top = (windowHeight - modal.offsetHeight) / 2;
      top = top >= 30 ? top : 30;
      top += "px";
      css(modal, {
        marginTop: top,
      });
    } else {
      !fullScreen &&
        css(modal, {
          marginTop: top,
        });
    }
  }

  function fullScreenModal(_ref2) {
    var bodyEl = _ref2.bodyEl,
      headerEl = _ref2.headerEl,
      footerEl = _ref2.footerEl,
      modal = _ref2.modal,
      modalContent = _ref2.modalContent;
    var height = 0;
    css(modal, {
      width: "100%",
      height: "100%",
      marginTop: "0px",
      padding: 0,
    });
    css(modalContent, {
      borderRadius: 0,
    });
    height =
      window.CocoMask.offsetHeight -
      (headerEl ? headerEl.offsetHeight : 0) -
      (footerEl ? footerEl.offsetHeight : 0) -
      1 +
      "px";
    css(bodyEl, {
      height: height,
    });
  }

  function focusEl() {
    var l = wrapperArray.length;
    if (!l) return;
    var a = wrapperArray[l - 1];

    if (a.inputAttrs) {
      a.autoFocusInput && a.inputEl && a.inputEl.focus();
    } else {
      a.autoFocusOkButton && a.okButtonEl && a.okButtonEl.focus();
    }
  }

  function resetModalIndex() {
    var a;
    wrapperArray.forEach(function (md, index) {
      a = md;
      md = md.wrapper;

      if (index === wrapperArray.length - 1) {
        css(md, {
          zIndex: a.zIndexOfActiveModal,
        });
      } else {
        css(md, {
          zIndex: a.zIndexOfModal,
        });
      }
    });
  }

  var createModalEl = function createModalEl(a) {
    var el = r(
      {
        class: "coco-modal-wrapper",
        role: "dialog-wrapper",
        tabindex: "-1",
        "@click": function click(e) {
          if (a.notMouseUp === 2 && a.maskClose && e.target === el) {
            beforeClose(a, "mask");
          }

          a.notMouseUp = 0;
        },
        "@mousedown": function mousedown(e) {
          a.notMouseUp = 0;

          if (a.maskClose && e.target === el) {
            a.notMouseUp++;
          }
        },
        "@mouseup": function mouseup(e) {
          if (a.maskClose && e.target === el) {
            a.notMouseUp++;
          }
        },
        is: [a, "wrapper"],
      },
      [
        r(
          {
            class: "coco-modal",
            role: "dialog",
            is: [a, "modal"],
          },
          [
            r(
              {
                class: "coco-modal-content",
                is: [a, "modalContent"],
              },
              [
                r({
                  class: "coco-modal-close",
                  "@click": function click() {
                    beforeClose(a, "closeButton");
                  },
                  is: [a, "closeButtonEl"],
                }),
                r(
                  {
                    class: "coco-modal-header",
                    is: [a, "headerEl"],
                  },
                  [
                    r(
                      {
                        class: "coco-modal-title",
                        is: [a, "titleEl"],
                      },
                      [
                        r({
                          el: "span",
                          is: [a, "titleSpan"],
                        }),
                      ]
                    ),
                  ]
                ),
                r(
                  {
                    class: "coco-modal-body",
                    is: [a, "bodyEl"],
                  },
                  [
                    r({
                      el: "span",
                      is: [a, "textEl"],
                    }),
                    r({
                      is: [a, "htmlEl"],
                    }),
                    r(
                      {
                        class: "coco-input-wrapper",
                        is: [a, "inputWrapper"],
                      },
                      [
                        r({}, [
                          r({
                            el: "input",
                            class: "coco-input",
                            is: [a, "inputEl"],
                          }),
                        ]),
                      ]
                    ),
                    r({}, [
                      r({
                        class: "",
                        is: [a, "domEl"],
                      }),
                    ]),
                    r({}, [
                      r({
                        class: "coco-error-text",
                        is: [a, "errorEl"],
                      }),
                    ]),
                  ]
                ),
                r(
                  {
                    class: "coco-modal-footer",
                    is: [a, "footerEl"],
                  },
                  [
                    r(
                      {
                        el: "button",
                        class: "coco-btn cancel",
                        is: [a, "cancelButtonEl"],
                      },
                      [
                        r({
                          el: "span",
                          is: [a, "cancelButtonSpan"],
                        }),
                      ]
                    ),
                    r(
                      {
                        el: "button",
                        class: "coco-btn ok",
                        is: [a, "okButtonEl"],
                      },
                      [
                        r({
                          el: "span",
                          class: "coco-loading",
                          style: "display:none",
                          is: [a, "loadingEl"],
                        }),
                        r({
                          el: "span",
                          is: [a, "okButtonSpan"],
                        }),
                      ]
                    ),
                  ]
                ),
              ]
            ),
          ]
        ),
      ]
    );
  };

  function needRender(a) {
    var headerEl = a.headerEl,
      footerEl = a.footerEl,
      inputWrapper = a.inputWrapper,
      htmlEl = a.htmlEl,
      html = a.html,
      okButtonEl = a.okButtonEl,
      cancelButtonEl = a.cancelButtonEl,
      okButton = a.okButton,
      cancelButton = a.cancelButton,
      header = a.header,
      footer = a.footer,
      inputAttrs = a.inputAttrs,
      closeButton = a.closeButton,
      closeButtonEl = a.closeButtonEl,
      el = a.el,
      domEl = a.domEl;
    !el && removeChildNode(domEl);
    !header && removeChildNode(headerEl);
    !footer && removeChildNode(footerEl);
    !inputAttrs && removeChildNode(inputWrapper);
    !okButton && removeChildNode(okButtonEl);
    !cancelButton && removeChildNode(cancelButtonEl);
    !closeButton && removeChildNode(closeButtonEl);
    !html && removeChildNode(htmlEl);
  }

  function removeChildNode(el) {
    el.parentNode.removeChild(el);
  }

  function initModalData(a) {
    var modal = a.modal,
      okButtonSpan = a.okButtonSpan,
      cancelButtonSpan = a.cancelButtonSpan,
      okText = a.okText,
      cancelText = a.cancelText,
      textEl = a.textEl,
      text = a.text,
      htmlEl = a.htmlEl,
      html = a.html,
      title = a.title,
      titleSpan = a.titleSpan,
      borderRadius = a.borderRadius,
      okButtonEl = a.okButtonEl,
      buttonColor = a.buttonColor,
      top = a.top,
      width = a.width,
      errorEl = a.errorEl;
    css(modal, {
      marginTop: top,
      width: width,
      borderRadius: borderRadius,
    });
    css(okButtonEl, {
      backgroundColor: buttonColor,
    });
    a.errorText = "";

    a.setErrorText = function (text) {
      errorEl.innerText = text;
      a.errorText = text;
    };

    titleSpan.innerText = title;
    textEl.innerText = text;
    htmlEl.innerHTML = html;
    okButtonSpan.innerText = okText;
    cancelButtonSpan.innerText = cancelText;
  }

  function initInput(a) {
    var inputEl = a.inputEl,
      inputAttrs = a.inputAttrs;

    for (var key in inputAttrs) {
      if (inputAttrs.hasOwnProperty(key)) {
        var el = inputAttrs[key];
        inputEl.setAttribute(key, el);
      }
    }

    addEvent(inputEl, "input", function (e) {
      a.inputValue = e.target.value;
    });
    addEvent(inputEl, "keyup", function (e) {
      if (e.code === "Enter") {
        beforeClose(a, "ok");
      }
    });
  }

  function initArgs(a) {
    if (w.CocoConfig) {
      for (var key in initOptions) {
        if (w.CocoConfig[key] !== undefined) {
          initOptions[key] = w.CocoConfig[key];
        }
      }
    }

    for (var _key in initOptions) {
      if (initOptions.hasOwnProperty(_key)) {
        if (a[_key] === undefined) {
          a[_key] = initOptions[_key];
        }
      }
    }
  }

  var CocoArgsArray = [];

  function isObjectEqual(a, b) {
    var equal = true;

    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }

    for (var key in a) {
      if (_typeof(a[key]) === "object" && _typeof(b[key]) === "object") {
        equal = isObjectEqual(a[key], b[key]);

        if (!equal) {
          return false;
        }
      } else if (typeof a[key] === "function" && typeof b[key] === "function") {
        if (a[key].toString() != b[key].toString()) {
          return false;
        }
      } else if (a[key] != b[key]) {
        return false;
      }
    }

    return equal;
  }

  function coco() {
    var text =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var title = arguments.length > 1 ? arguments[1] : undefined;
    var args =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var a = {};
    var al = arguments.length;

    if (_typeof(text) === "object") {
      args = text;
    } else {
      text = text.toString();

      if (typeof title === "string") {
        args.title = title;
      } else if (_typeof(title) === "object") {
        args = title;
      }

      args.text = text;
    }

    if (arguments.length > 1 && arguments[al - 1] === "alert") {
      args.cancelButton = false;
      args.maskClose = false;
      args.closeButton = false;
    } else if (arguments.length > 1 && arguments[al - 1] === "confirm") {
      args.maskClose = false;
      args.closeButton = false;
    }

    a = args;
    args = Object.assign({}, args);

    for (var i = 0; i < CocoArgsArray.length; i++) {
      if (isObjectEqual(args, CocoArgsArray[i].args)) {
        CocoArgsArray[i].a.openModal();
        return CocoArgsArray[i].a;
      }
    }

    CocoArgsArray.push({
      args: args,
      a: a,
    });
    a.args = args;
    a.isLoading = false;
    a.notMount = true;
    a.isOpen = true;
    a.scrollbarWidth = scrollbarWidth;
    initArgs(a);

    a.close = function (type) {
      type = type ? type : "closeFunction";
      beforeClose(a, type);
    };

    a.openModal = function () {
      showModal(a);
    };

    a.onClose = function (fn) {
      a.beforeCloseFn = fn;
      return a;
    };

    a.destroyModal = function () {
      a.destroy = true;
    };

    createModalEl(a);
    initModal(a);
    addEvent(a.okButtonEl, "click", function () {
      beforeClose(a, "ok");
    });
    addEvent(a.okButtonEl, "keypress", function (e) {
      e.preventDefault();
    });
    addEvent(a.cancelButtonEl, "click", function () {
      beforeClose(a, "cancel");
    });

    a.showLoading = function () {
      a.isLoading = true;
      addClass(a.okButtonEl, "coco-is-loading");
      if (a.loadingEl) a.loadingEl.style.display = "inline-block";
    };

    a.hideLoading = function () {
      a.isLoading = false;
      removeClass(a.okButtonEl, "coco-is-loading");
      if (a.loadingEl) a.loadingEl.style.display = "none";
    };

    return a;
  }

  coco.alert = function (text, title, args) {
    return coco(text, title, args, "alert");
  };

  coco.confirm = function (text, title, args) {
    return coco(text, title, args, "confirm");
  };

  addEvent(w, "DOMContentLoaded", function () {
    init();
  });
  var Initialized = false;

  function init() {
    if (Initialized) {
      return;
    }

    doc = w.document;
    body = doc.body;
    docEl = doc.documentElement;
    insertCssInHead();
    scrollbarWidth = getBarWidth();
    Initialized = true;
  }

  function insertCssInHead() {
    if (doc && doc.head) {
      var head = doc.head;

      var _css = doc.createElement("style");

      var cssStr =
        '\n@-webkit-keyframes coco-loading {\n  0% {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n@keyframes coco-loading {\n  0% {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n@-webkit-keyframes cocoFadeIn {\n  0% {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes cocoFadeIn {\n  0% {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes cocoFadeOut {\n  0% {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}\n@keyframes cocoFadeOut {\n  0% {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}\n@-webkit-keyframes cocoZoomIn {\n  0% {\n    transform: scale3d(0.25, 0.25, 0.25);\n    opacity: 0;\n  }\n  to {\n    transform: scale3d(1, 1, 1);\n    opacity: 1;\n  }\n}\n@keyframes cocoZoomIn {\n  0% {\n    transform: scale3d(0.25, 0.25, 0.25);\n    opacity: 0;\n  }\n  to {\n    transform: scale3d(1, 1, 1);\n    opacity: 1;\n  }\n}\n@-webkit-keyframes cocoZoomOut {\n  0% {\n    transform: scale3d(1, 1, 1);\n    opacity: 1;\n  }\n  to {\n    transform: scale3d(0, 0, 0);\n    opacity: 0;\n  }\n}\n@keyframes cocoZoomOut {\n  0% {\n    transform: scale3d(1, 1, 1);\n    opacity: 1;\n  }\n  to {\n    transform: scale3d(0, 0, 0);\n    opacity: 0;\n  }\n}\n[class|="coco"],\n[class|="coco"]::after,\n[class|="coco"]::before {\n  box-sizing: border-box;\n  outline: 0;\n}\n.coco-modal-mask,\n.coco-modal-wrapper {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n}\n.coco-modal-wrapper {\n  right: 0;\n  bottom: 0;\n  overflow: auto;\n  -webkit-overflow-scrolling: touch;\n  z-index: 2020;\n}\n.coco-modal-mask {\n  background-color: rgba(0, 0, 0, 0.425);\n  z-index: 2008;\n}\n.coco-modal-mask.blur {\n  -webkit-backdrop-filter: blur(5px);\n  backdrop-filter: blur(5px);\n  background-color: rgba(0, 0, 0, 0.5);\n}\n.coco-modal {\n  position: relative;\n  margin: 0 auto;\n  margin-top:15vh;\n  top: 0;\n  width: 500px;\n  transform: translateZ(0);\n  line-height: 1.66667;\n  list-style: none;\n  font-size: 14px;\n}\n.coco-modal-content {\n  border-radius: 5px;\n  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.05), 0 0 4px 0 rgba(0, 0, 0, 0.08);\n  background-color: #fff;\n}\n.coco-modal-content.coco-no-shadow {\n  box-shadow: none;\n}\n.fade-enter,\n.fade-leave {\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n  -webkit-animation-play-state: paused;\n  animation-play-state: paused;\n  -webkit-animation-timing-function: linear;\n  animation-timing-function: linear;\n  -webkit-animation-duration: 0.14s;\n  animation-duration: 0.14s;\n  transition: none;\n  pointer-events: none;\n  transform: translateZ(0);\n  will-change: opacity;\n}\n.fade-enter {\n  opacity: 0;\n}\n.fade-leave {\n  -webkit-animation-delay: 0.08s;\n  animation-delay: 0.08s;\n}\n.fade-enter.fade-enter-active {\n  -webkit-animation-name: cocoFadeIn;\n  animation-name: cocoFadeIn;\n  -webkit-animation-play-state: running;\n  animation-play-state: running;\n}\n.fade-leave.fade-leave-active,\n.zoom-enter.zoom-enter-active,\n.zoom-leave.zoom-leave-active {\n  -webkit-animation-name: cocoFadeOut;\n  animation-name: cocoFadeOut;\n  -webkit-animation-play-state: running;\n  animation-play-state: running;\n}\n.zoom-enter {\n  -webkit-animation-duration: 0.3s;\n  animation-duration: 0.3s;\n}\n.zoom-enter,\n.zoom-leave {\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n  -webkit-animation-play-state: paused;\n  animation-play-state: paused;\n  transition: none;\n  pointer-events: none;\n  transform: translateZ(0);\n  will-change: opacity, transform;\n}\n.zoom-enter {\n  -webkit-animation-delay: 0.08s;\n  animation-delay: 0.08s;\n  opacity: 0;\n  -webkit-animation-timing-function: cubic-bezier(0.08, 0.8, 0.18, 1);\n  animation-timing-function: cubic-bezier(0.08, 0.8, 0.18, 1);\n}\n.zoom-enter.zoom-enter-active,\n.zoom-leave.zoom-leave-active {\n  -webkit-animation-name: cocoZoomIn;\n  animation-name: cocoZoomIn;\n}\n.zoom-leave {\n  -webkit-animation-duration: 0.28s;\n  animation-duration: 0.28s;\n  -webkit-animation-timing-function: cubic-bezier(0.52, 0.3, 0.06, 1);\n  animation-timing-function: cubic-bezier(0.52, 0.3, 0.06, 1);\n}\n.zoom-leave.zoom-leave-active {\n  -webkit-animation-name: cocoZoomOut;\n  animation-name: cocoZoomOut;\n}\n\n.coco-modal-close {\n  position: absolute;\n  width: 26px;\n  height: 26px;\n  width: 20px;\n  height: 20px;\n  right: 15px;\n  top: 17px;\n  z-index: 1;\n  cursor: pointer;\n}\n.coco-modal-close:hover::before,\n.coco-modal-close:hover::after {\n    background-color: #646464;\n}\n\n.coco-modal-close:active::before,\n.coco-modal-close:active::after {\n    background-color: #010000; \n}\n.coco-modal-close::after,\n.coco-modal-close::before {\n  content: "";\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%) rotate(-45deg) scale(1);\n  width: 1px;\n  height: 14px;\n  background-color: #787878;\n  transition: all 0.15s ease-out;\n  display: block;\n  border-radius: 2px;\n}\n.coco-modal-close::after {\n  transform: translate(-50%, -50%) rotate(45deg) scale(1);\n}\n.coco-modal-close:hover::after,\n.coco-modal-close:hover::before {\n  background-color: #646464;\n}\n.coco-modal-close:active::after,\n.coco-modal-close:active::before {\n  background-color: #010000;\n}\n.coco-modal-body,\n.coco-modal-header {\n  position: relative;\n  font-size: 18px;\n  color: #111;\n  text-align: left;\n}\n.coco-modal-body {\n  padding: 22px 18px;\n  font-size: 14px;\n  color: #646466;\n  overflow: auto;\n}\n.coco-modal-header {\n  height: 60px;\n  padding: 0 18px;\n}\n.coco-modal-header::before {\n  content: "";\n  display: inline-block;\n  vertical-align: middle;\n  height: 100%;\n}\n.coco-modal-title {\n  position: relative;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  vertical-align: middle;\n  width: 100%;\n  display: inline-block;\n}\n.coco-modal-footer {\n  position: relative;\n  text-align: right;\n  padding: 15px 18px;\n}\n.coco-btn {\n  font-size: 14px;\n  text-decoration: none;\n  padding: 6px 20px;\n  white-space: nowrap;\n  border-radius: 5px;\n  font-weight: 500;\n  display: inline-block;\n  cursor: pointer;\n  border: 0;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  line-height: normal;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.coco-btn.cancel {\n  margin-right: 10px;\n  color: #525456;\n  background-color: transparent;\n  font-weight: 500;\n  transition: all 0.06s ease-out;\n}\n\n.coco-btn,\n.coco-btn span,\n.coco-loading {\n  position: relative;\n}\n.coco-btn.ok {\n  background-color: #0077ff;\n  color: #fefefe;\n}\n.coco-btn.ok::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  border-radius: inherit;\n  transition: all 0.12s ease-out;\n  background-color: transparent;\n}\n.coco-btn.ok:hover::before {\n  background-color: rgba(255, 255, 255, 0.08);\n}\n.coco-btn.ok:active::before {\n  transition: all 80ms ease-out;\n  background-color: rgba(0, 0, 0, 0.2);\n}\n.coco-btn.ok.coco-is-loading::before {\n  background-color: transparent;\n}\n.coco-loading {\n  width: 14px;\n  height: 14px;\n  border: 2px solid #fff;\n  border-top: 2px solid transparent;\n  border-radius: 7px;\n  margin-right: 7px;\n  display: none;\n  -webkit-animation: coco-loading 1s linear infinite;\n  animation: coco-loading 1s linear infinite;\n}\n.coco-is-loading {\n  cursor: not-allowed;\n}\n.coco-hidden {\n  visibility: hidden;\n}\n\n.coco-input {\n  margin: 14px 0;\n  width: 100%;\n  height: 38px;\n  border-radius: 5px;\n  padding: 6px 15px;\n  font-weight: 400;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  color: #212122;\n  background-color: #f3f3f3;\n  border: 1px solid transparent;\n  font-size: 14px;\n  box-shadow: 0 0 0 0 rgba(88, 161, 245, 0.2);\n  line-height: normal;\n  transition: all 0.1s ease-out;\n}\n.coco-input::-webkit-input-placeholder {\n  line-height: 24px;\n  color: #a2a2a3;\n}\n.coco-input::-moz-placeholder {\n  line-height: 24px;\n  color: #a2a2a3;\n}\n.coco-input:-ms-input-placeholder,\n.coco-input::-ms-input-placeholder {\n  line-height: 24px;\n  color: #a2a2a3;\n}\n.coco-input::-webkit-input-placeholder {\n  line-height: 24px;\n  color: #a2a2a3;\n}\n.coco-input::-moz-placeholder {\n  line-height: 24px;\n  color: #a2a2a3;\n}\n.coco-input:-ms-input-placeholder {\n  line-height: 24px;\n  color: #a2a2a3;\n}\n.coco-input::-ms-input-placeholder {\n  line-height: 24px;\n  color: #a2a2a3;\n}\n.coco-input::placeholder {\n  line-height: 24px;\n  color: #a2a2a3;\n}\n.coco-input:hover {\n  background-color: #efefef;\n}\n.coco-input:focus {\n  transition: all 0.2s ease;\n  background-color: #fff;\n  box-shadow: 0 0 0 2px rgba(88, 161, 245, 0.2);\n  border-color: rgba(66, 133, 255, 0.5);\n}\n.coco-input:active {\n  transition: all 0.1s ease;\n  background-color: #fff;\n  border-color: #cecece;\n  box-shadow: 0 0 0 0 rgba(88, 161, 245, 0.2);\n}\n.coco-error-text {\n  font-size: 14px;\n  color: #e71e63;\n  margin: 5px 10px;\n}\n\n';
      addSomeEvents();
      _css.innerHTML = cssStr;

      if (head.children.length) {
        head.insertBefore(_css, head.children[0]);
      } else {
        head.appendChild(_css);
      }
    }
  }

  return coco;
});
