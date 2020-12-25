!(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global = global || self, global.coco = factory());
}(this, function () {
    'use strict';
    let w = window
    let doc = null
    let body = null
    let docEl = null
    let scrollbarWidth = 0

    let bodyStyle = {}

    let inBrowser = typeof w !== 'undefined';
    let isAnimation = ieVersion() > 9 || true
    let raf = inBrowser ?
        w.requestAnimationFrame ?
        w.requestAnimationFrame.bind(w) :
        setTimeout :
        function (fn) {
            return fn();
        };
    let initOptions = {
        maskClose: true,
        header: true,
        footer: true,
        title: '提示',
        text: '',
        width: '',
        top: '',
        inputAttrs: false,
        escClose: true,
        okButton: true,
        cancelButton: true,
        okText: '确定',
        cancelText: '取消',
        closeButton: true,
        html: '',
        zIndexOfModal: 1995,
        zIndexOfMask: 2008,
        zIndexOfActiveModal: 2020,
        autoFocusOkButton: true,
        autoFocusInput: true,
        fullScreen: false,
        borderRadius: '',
        blur: false,
        buttonColor: '',
        hooks: {},
        destroy: false,
        animation: isAnimation
    }
    let Initialized = false
    let CocoConfig = {}

    function ieVersion() {
        let theUA = w.navigator.userAgent.toLowerCase();
        if ((theUA.match(/msie\s\d+/) && theUA.match(/msie\s\d+/)[0]) || (theUA.match(/trident\s?\d+/) &&
                theUA.match(/trident\s?\d+/)[0])) {
            return theUA.match(/msie\s\d+/)[0].match(/\d+/)[0] || theUA.match(/trident\s?\d+/)[0];

        }
    }

    function nowTime() {
        return Date.now()
    }

    function rafTimeout(fn, time) {
        let now = nowTime()

        function step() {
            if (nowTime() - now < time) {
                raf(step)
            } else {
                fn()
            }
        }
        raf(step);
    }

    rafTimeout = w.requestAnimationFrame ? rafTimeout : w.setTimeout;

    let MousePos = {}
    let clickTime = 0
    let keyDownTime = 0

    function setPointerPosition(e) {
        MousePos.x = e.clientX
        MousePos.y = e.clientY
        clickTime = nowTime()
    }





    function addSomeEvents() {

        addEvent(docEl, 'click', setPointerPosition, true);
        addEvent(w, 'keydown', () => {
            keyDownTime = nowTime()
        }, true)

        addEvent(w, 'keyup', e => {
            let l = wrapperArray.length
            if (e.keyCode === 27 && l) {
                let a = wrapperArray[l - 1]
                if (a.escClose) {
                    if (a.$el) {
                        beforeCloseVue(a, 'esc')
                    } else {
                        beforeClose(a, 'esc')
                    }
                }
            }
        })

        addEvent(w, 'resize', () => {
            let modal = null
            wrapperArray.forEach(md => {
                modal = md.modal;
                setTransformOrigin(modal);
            })
        })
    }

    function addClass(el, s) {
        let c = el.className || "";
        if (!hasClass(c, s)) {
            let arr = c.split(/\s+/);
            arr.push(s);
            el.className = arr.join(" ");
        }
    }

    function hasClass(c, s) {
        return c.indexOf(s) > -1 ? !0 : !1;
    }

    function removeClass(el, s) {
        let c = el.className || "";
        if (hasClass(c, s)) {
            let arr = c.split(/\s+/);
            let i = arr.indexOf(s);
            arr.splice(i, 1);
            el.className = arr.join(" ");
        }
        if (el.getAttribute('class') === '') {
            el.removeAttribute('class')
        }
    }

    function addEvent(el, name, fn, c) {
        el.addEventListener(name, fn, c)
    }


    function getStyle(el, value) {
        if (w.getComputedStyle) {
            return getComputedStyle(el)[value]
        } else {
            return el.currentStyle[value]
        }
    }


    function hideBodyBar(windowWidth) {

        let width = getStyle(body, 'width')
        let bodyWidth = body.style.width
        let bodyOverflow = body.style.overflow
        let bodyPosition = body.style.position

        bodyStyle.position = bodyPosition
        bodyStyle.overflow = bodyOverflow
        bodyStyle.width = bodyWidth

        width = windowWidth < parseInt(width) ? width : `calc(100% - ${scrollbarWidth}px)`

        css(body, {
            position: (bodyPosition === '' ? 'relative' : bodyPosition),
            overflow: 'hidden',
            width
        })
    }

    function deleteBodyStyle() {
        css(body, {
            position: bodyStyle.position,
            overflow: bodyStyle.overflow === 'visible' ? '' : bodyStyle.overflow,
            width: bodyStyle.width
        })
    }



    function getBarWidth() {
        let d = doc.createElement("div"),
            d1 = doc.createElement("div"),
            w1 = 0,
            w2 = 0
        d.style.width = "1000px";
        d.style.position = "fixed";
        d.style.top = "100%";
        d.style.overflow = "scroll";
        d1.style.width = "100%";
        d.appendChild(d1);
        body.appendChild(d);
        w1 = d.offsetWidth;
        w2 = d1.offsetWidth;
        removeChildNode(d)
        return w1 - w2;
    }




    const r = (node, children = []) => {
        let {
            el
        } = node
        el = doc.createElement(node.el || 'div')

        delete node.el
        for (const key in node) {
            if (key === 'is') {
                let arr = node[key]
                arr[0][arr[1]] = el
                continue
            }
            if (node.hasOwnProperty(key)) {
                let val = node[key];
                if (key[0] === '@') {
                    let name = key.slice(1)
                    addEvent(el, name, val)
                } else {
                    el.setAttribute(key, val)
                }
            }
        }
        if (typeof children === 'object') {
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                el.appendChild(child)
            }
        }
        return el
    }



    function css(el, css) {
        for (let key in css) {
            el.style[key] = css[key]
        }
        if (el.getAttribute('style') === '') {
            el.removeAttribute('style')
        }
    }
    let CocoMask = null;

    function showMask(a) {
        if (CocoMask) return;
        CocoMask = r({
            class: 'coco-modal-mask blur'
        })
        a.mask = CocoMask
        body.appendChild(CocoMask);
    }




    let wrapperArray = []


    function isHideScrollbar() {
        (body.scrollHeight > CocoMask.offsetHeight) &&
        (getStyle(body, 'overflowY') !== 'hidden') &&
        hideBodyBar(CocoMask.offsetWidth)
    }

    function blurModal() {
        let l = wrapperArray.length
        if (l) {
            let a = wrapperArray[l - 1] && wrapperArray[l - 1]
            a.inputEl && a.inputEl.blur();
            a.okButtonEl && a.okButtonEl.blur();
        }
    }
    let modalElID = {}

    function initModal(a) {
        let {
            wrapper,
            modal,
            okButtonEl,
            destroy,
            el,
            inputAttrs
        } = a;
        initModalData(a)
        needRender(a)
        addEvent(wrapper, 'scroll', _ => {
            scrollOrigin(a, wrapper, modal)
        })
        if (inputAttrs) {
            initInput(a)
        }
        addEvent(okButtonEl, 'keyup', e => {
            if (e.keyCode === 13) {
                beforeClose(a, 'ok')
            }
        })

        if (el) {
            let elm = modalElID[el]
            if (!elm) {
                try {
                    if (el.tagName === undefined) {
                        elm = doc.querySelector(el)
                    } else {
                        elm = el
                    }
                } catch (error) {
                    throw new Error(error)
                }
                modalElID[el] = elm
            }
            if (destroy) {
                elm = elm.cloneNode(true)
            }
            removeClass(elm, 'coco-hidden')
            a.bodyEl.appendChild(elm)
        }
        let div = r({})
        a.div = div
        div.appendChild(wrapper);
        body.appendChild(div);
        css(wrapper, {
            display: 'none'
        })
        showModal(a)
    }
    let cocoFocusEl = null;

    function scrollOrigin(a, wrapper, modal) {
        let offsetX = wrapper.scrollLeft - a.scrollLeft
        let offsetY = wrapper.scrollTop - a.scrollTop
        let x = a.originX + offsetX;
        let y = a.originY + offsetY;
        let origin = x + 'px ' + y + 'px';
        setTransformOrigin(modal, origin);
    }

    function inArray(el, array) {
        let has = false
        array.forEach(it => {
            if (it === el) {
                has = true
            }
        })
        return has;
    }

    function displayModal(wrapper) {
        css(wrapper, {
            display: ''
        })
        css(CocoMask, {
            display: ''
        });
    }

    function isBlur(blur, modalContent) {
        if (blur) {
            addClass(CocoMask, 'blur')
            addClass(modalContent, 'coco-no-shadow')
        } else {
            CocoMask && removeClass(CocoMask, 'blur')
            modalContent && removeClass(modalContent, 'coco-no-shadow')
        }
    }

    function addModal(a) {
        wrapperArray.push(a);
    }

    function startAnimation(el, name, type) {
        type = type ? 'enter' : 'leave';
        addClass(el, name + '-' + type)
        addClass(el, name + '-' + type + '-active')
    }

    function clearClass(el, name, type) {
        type = type ? 'enter' : 'leave';
        removeClass(el, name + '-' + type)
        removeClass(el, name + '-' + type + '-' + 'active')

    }

    function setModalZIndex(a) {

        let {
            wrapper,
            zIndexOfMask,
            zIndexOfActiveModal
        } = a;
        css(wrapper, {
            zIndex: zIndexOfActiveModal
        })
        css(CocoMask, {
            zIndex: zIndexOfMask
        })
    }

    function showModal(a) {
        let {
            wrapper,
            modal,
            blur,
            modalContent,
            animation,
            onMount,
            notMount,
            fullScreen,
            hooks,
            isClosed,
            inputAttrs
        } = a;
        if (inArray(a, wrapperArray) || !isClosed) {
            return
        }
        let duration = animation ? 380 : 0;
        a.isOpen = true
        a.openTime = nowTime();
        cocoFocusEl = doc.activeElement

        showMask(a);
        setModalZIndex(a)
        isBlur(blur, modalContent);
        blurModal();
        addModal(a);
        (wrapperArray.length > 1) && resetModalIndex();
        displayModal(wrapper)

        isHideScrollbar();
        a.scrollTop = wrapper.scrollTop
        a.scrollLeft = wrapper.scrollLeft
        if (wrapperArray.length === 1) {
            animation && startAnimation(CocoMask, 'fade', true)
        }
        if (inputAttrs) {
            a.inputValue = a.inputEl.value || ''
        }
        fullScreen && fullScreenModal(a)
        paddingBottom(modal)
        positionCenter(a);
        animation && isOrigin(a, modal)
        animation && startAnimation(modal, 'zoom', true)
        notMount && onMount && onMount(a)
        a.notMount = false
        hooks && hooks.open && hooks.open(a)
        isFocusEl(modal)
        rafTimeout(() => {
            clearClass(modal, 'zoom', true)
            clearClass(CocoMask, 'fade', true)
            hooks && hooks.opened && hooks.opened(a)
        }, duration);

    }

    function closeModal(a) {
        let {
            openTime,
            wrapper,
            modal,
            isOpen,
            destroy,
            div,
            animation,
            args,
            hooks,
        } = a
        let duration = animation ? 280 : 0;

        if (nowTime() - openTime < 380 || !isOpen) return;

        a.isOpen = false;
        a.isClosed = false;
        deleteArraryItems(a, wrapperArray)


        animation && startAnimation(modal, 'zoom')
        if (!wrapperArray.length) {
            animation && startAnimation(CocoMask, 'fade')
        }

        hooks && hooks.close && hooks.close(a);
        rafTimeout(() => {
            (wrapperArray.length > 0) && resetModalIndex();
            clearClass(modal, 'zoom')
            clearClass(CocoMask, 'fade')
            if (!wrapperArray.length) {
                if (destroy) {
                    body.contains(CocoMask) && removeChildNode(CocoMask)
                    CocoMask = null;
                } else {
                    css(CocoMask, {
                        display: 'none'
                    })
                }
                deleteBodyStyle()
            }

            a.isClosed = true;
            cocoFocusEl && cocoFocusEl.focus();
            hooks && hooks.closed && hooks.closed(a)

            if (destroy) {
                body.contains(div) && removeChildNode(div)

                deleteArraryItems({
                    a,
                    args
                }, CocoArgsArray, true)


                for (const key in a) {
                    if (a.hasOwnProperty(key)) {
                        a[key] = null
                        delete a[key]
                    }
                }
                a = null
            } else {
                css(wrapper, {
                    display: 'none'
                })
            }
        }, duration);
    }

    function paddingBottom(modal) {
        let needPaddingBottom =
            modal.offsetHeight + modal.offsetTop > CocoMask.offsetHeight
        if (needPaddingBottom) {
            css(modal, {
                paddingBottom: '30px'
            })
        }
    }

    function isFocusEl(modal) {
        if (
            modal.offsetHeight <= CocoMask.offsetHeight &&
            modal.offsetWidth <= CocoMask.offsetWidth
        ) {
            focusEl()
        }
    }

    function deleteArraryItems(item, arr, args) {
        let i = 0
        if (args) {

            arr.forEach((it, index) => {
                if (it.a === item.a) {
                    i = index
                    arr.splice(i, 1)
                }
            })
        } else {
            arr.forEach((it, index) => {
                if (it === item) {
                    i = index
                    arr.splice(i, 1)
                }
            })
        }
        return i
    }


    function setTransformOrigin(node, value) {
        let style = node.style;
        value = value ? value : '';
        ['t', 'webkitT', 'MozT', 'msT', 'OT'].forEach(function (prefix) {
            if (prefix + 'ransformOrigin' in style)
                style[prefix + 'ransformOrigin'] = value;
        });
    }

    function pos(el) {
        let rect = el.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top
        }
    }

    function isOrigin(a, modal) {

        let isClick = ((nowTime() - clickTime) < 120)
        let notKeyDown = (Math.abs(clickTime - keyDownTime) >= 60);
        if (isClick && notKeyDown) {
            let {
                left,
                top
            } = pos(modal);
            let x = MousePos.x - left
            let y = MousePos.y - top
            let origin = x + 'px ' + y + 'px';
            a.originX = x;
            a.originY = y;
            setTransformOrigin(modal, origin);
        } else {
            setTransformOrigin(modal);
        }
    }

    function positionCenter({
        top,
        modal
    }) {
        if (top === 'center') {

            let windowHeight = CocoMask.offsetHeight

            top = (windowHeight - modal.offsetHeight) / 2;
            top = top >= 0 ? top : 0
            top += 'px'
            css(modal, {
                top
            })
        }
    }


    function fullScreenModal({
        bodyEl,
        headerEl,
        footerEl,
        modal,
        modalContent,
    }) {
        let height = 0;

        css(modal, {
            width: '100%',
            height: '100%',
            top: 0,
            padding: 0
        })
        css(modalContent, {
            borderRadius: 0,
        })
        height = (CocoMask.offsetHeight - (headerEl.offsetHeight) - footerEl.offsetHeight - 1) + 'px'
        css(bodyEl, {
            height
        })

    }

    function focusEl() {
        let l = wrapperArray.length
        if (!l) return;
        let a = wrapperArray[l - 1];
        if (a.inputAttrs) {
            a.autoFocusInput && a.inputEl && a.inputEl.focus()
        } else {
            a.autoFocusOkButton && a.okButtonEl && a.okButtonEl.focus()
        }

    }

    function resetModalIndex() {
        let a;
        wrapperArray.forEach((md, index) => {
            a = md;
            md = md.wrapper
            if (index === wrapperArray.length - 1) {
                css(md, {
                    zIndex: a.zIndexOfActiveModal
                })
            } else {
                css(md, {
                    zIndex: a.zIndexOfModal
                })
            }
        })
    }

    const createmodalEl = (a) => {
        let el = r({
            class: 'coco-modal-wrapper',
            role: "dialog-wrapper",
            'tabindex': "-1",
            '@click'(e) {
                if (a.maskClose && e.target === el) {
                    beforeClose(a, 'mask')
                }
            },
            is: [a, 'wrapper']
        }, [

            r({
                class: 'coco-modal',
                role: "dialog",
                is: [a, 'modal']
            }, [
                r({
                    class: 'coco-modal-content',
                    is: [a, 'modalContent']
                }, [

                    r({
                        class: 'coco-modal-close',
                        '@click'() {
                            beforeClose(a, 'closeButton')
                        },
                        is: [a, 'closeButtonEl']
                    }),
                    r({
                        class: 'coco-modal-header',
                        is: [a, 'headerEl']
                    }, [
                        r({
                            class: 'rt-modal-title',
                            is: [a, 'titleEl']
                        }, [
                            r({
                                el: 'span',
                                is: [a, 'titleSpan']
                            })
                        ])
                    ]),
                    r({
                        class: 'coco-modal-body',
                        is: [a, 'bodyEl']

                    }, [
                        r({
                            el: 'span',
                            is: [a, 'textEl']
                        }),
                        r({
                            is: [a, 'htmlEl']
                        }),
                        r({
                            class: 'coco-input-wrapper',
                            is: [a, 'inputWrapper']
                        }, [
                            r({}, [
                                r({
                                    el: 'input',
                                    class: 'coco-input',
                                    is: [a, 'inputEl']
                                })
                            ]),
                            r({}, [
                                r({
                                    class: 'coco-error-text',
                                    is: [a, 'errorEl']
                                })
                            ])
                        ])
                    ]),
                    r({
                        class: 'coco-modal-footer',
                        is: [a, 'footerEl']
                    }, [

                        r({
                            el: 'button',
                            class: 'coco-btn ok',
                            is: [a, 'okButtonEl']
                        }, [
                            r({
                                el: 'span',
                                class: 'coco-loading',
                                is: [a, 'loadingEl']
                            }),
                            r({
                                el: 'span',
                                is: [a, 'okButtonSpan']
                            })
                        ]),

                        r({
                            el: 'button',
                            class: 'coco-btn cancel',
                            is: [a, 'cancelButtonEl']
                        }, [
                            r({
                                el: 'span',
                                is: [a, 'cancelButtonSpan']
                            })
                        ]),

                    ]),

                ])
            ])

        ])
    }

    function beforeClose(a, way) {
        let isOk = (way === 'ok')
        a.closeType = way
        if (a.isLoading && way === 'ok') {
            return
        }
        if (a.beforeCloseFn) {
            if (a.beforeCloseFn.length < 2) {
                a.beforeCloseFn(a)
                closeModal(a)
            } else if (a.beforeCloseFn.length === 2) {
                a.beforeCloseFn(a, isOk)
                closeModal(a)
            } else {
                a.beforeCloseFn(a, isOk, () => {
                    closeModal(a)
                })
            }
        } else {
            closeModal(a)
        }
    }

    function needRender(a) {
        let {
            headerEl,
            footerEl,
            inputWrapper,
            htmlEl,
            html,
            okButtonEl,
            cancelButtonEl,
            okButton,
            cancelButton,
            header,
            footer,
            inputAttrs,
            closeButton,
            closeButtonEl
        } = a;
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
        let {
            modal,
            okButtonSpan,
            cancelButtonSpan,
            okText,
            cancelText,
            textEl,
            text,
            htmlEl,
            html,
            title,
            titleSpan,
            borderRadius,
            okButtonEl,
            buttonColor,
            top,
            width
        } = a;

        css(modal, {
            top,
            width,
            borderRadius,
        });
        css(okButtonEl, {
            backgroundColor: buttonColor
        })
        titleSpan.innerText = title
        textEl.innerText = text
        htmlEl.innerHTML = html
        okButtonSpan.innerText = okText
        cancelButtonSpan.innerText = cancelText

    }

    function initInput(a) {
        let {
            inputEl,
            inputAttrs,
            errorEl
        } = a;
        for (const key in inputAttrs) {
            if (inputAttrs.hasOwnProperty(key)) {
                const el = inputAttrs[key];
                inputEl.setAttribute(key, el)
            }
        }
        a.errorText = ''
        a.setErrorText = text => {
            errorEl.innerText = text
            a.errorText = text
        }
        addEvent(inputEl, 'input', e => {
            a.inputValue = e.target.value
        })
        addEvent(inputEl, 'keyup', e => {
            if (e.keyCode === 13) {
                beforeClose(a, 'ok')
            }
        })

    }

    function initArgs(a) {
        for (const key in initOptions) {
            if (CocoConfig[key] !== undefined) {
                initOptions[key] = CocoConfig[key]
            }

        }
        for (const key in initOptions) {
            if (initOptions.hasOwnProperty(key)) {
                if (a[key] === undefined) {
                    a[key] = initOptions[key]
                }
            }
        }
    }

    let CocoArgsArray = []

    function isObjectEqual(a, b) {
        let equal = true
        if (Object.keys(a).length !== Object.keys(b).length) {
            return false
        }

        for (const key in a) {
            if (
                typeof a[key] === 'object' &&
                typeof b[key] === 'object'
            ) {
                equal = isObjectEqual(a[key], b[key])
                if (!equal) {
                    return false
                }
            } else if (
                typeof a[key] === 'function' &&
                typeof b[key] === 'function'
            ) {
                if (a[key].toString() != b[key].toString()) {
                    return false
                }
            } else if (a[key] != b[key]) {
                return false
            }
        }
        return equal
    }

    function copy(obj) {
        let newObj = {}
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {

                newObj[key] = obj[key];

            }
        }
        return newObj;
    }

    function coco(text, title, args = {}) {
        if (!Initialized) {
            throw new Error("请先运行 'coco.init()' 方法!")
        }

        if (typeof Vue !== 'undefined' && Vue.prototype.$isServer) return;
        let a = {}
        let al = arguments.length
        if (typeof text === 'object') {
            args = text
        } else {
            text = text.toString();
            if (typeof title === 'string') {
                args.title = title
            } else if (typeof title === 'object') {
                args = title
            }
            args.text = text
        }
        if (arguments.length > 1 && arguments[al - 1] === 'alert') {
            args.cancelButton = false
            args.maskClose = false
            args.closeButton = false
        } else if (arguments.length > 1 && arguments[al - 1] === 'confirm') {
            args.maskClose = false
            args.closeButton = false
        }
        a = args
        args = copy(args)

        for (let i = 0; i < CocoArgsArray.length; i++) {

            if (isObjectEqual(args, CocoArgsArray[i].args)) {
                CocoArgsArray[i].a.openModal()
                return CocoArgsArray[i].a
            }
        }
        CocoArgsArray.push({
            args,
            a
        })
        a.args = args
        a.openTime = 0
        a.isLoading = false
        a.notMount = true
        a.isClosed = true
        a.scrollbarWidth = scrollbarWidth
        initArgs(a)


        a.close = function (type) {
            type = type ? type : 'closeFunction'
            beforeClose(a, type);
        }
        a.openModal = function () {
            showModal(a)
        }
        a.onClose = function (fn) {
            a.beforeCloseFn = fn
            return a
        }
        createmodalEl(a)
        initModal(a)

        addEvent(a.okButtonEl, 'click', e => {
            beforeClose(a, 'ok')
        })
        addEvent(a.okButtonEl, 'keypress', e => {
            e.preventDefault()
        })

        addEvent(a.cancelButtonEl, 'click', e => {
            beforeClose(a, 'cancel')
        })
        a.showLoading = function () {
            a.isLoading = true
            addClass(a.okButtonEl, 'coco-is-loading')
            if (a.loadingEl)
                a.loadingEl.style.display = 'inline-block'
        }
        a.hideLoading = function () {
            a.isLoading = false
            removeClass(a.okButtonEl, 'coco-is-loading')
            if (a.loadingEl)
                a.loadingEl.style.display = 'none'
        }
        return a
    }

    coco.alert = function (text, title, args) {
        return coco(text, title, args, 'alert')
    }
    coco.confirm = function (text, title, args) {
        return coco(text, title, args, 'confirm')
    }
    coco.init = function (obj = {}) {
        if (Initialized) {
            return;
        }
        doc = w.document
        body = doc.body
        docEl = doc.documentElement
        insertCssInHead();
        scrollbarWidth = getBarWidth();
        if (docEl) {}
        for (const key in initOptions) {
            if (obj[key] !== undefined) {
                initOptions[key] = obj[key]
            }
        }
        CocoConfig = obj
        Initialized = true
    }

    function insertCssInHead() {
        if (doc && doc.head) {
            let head = doc.head
            let css = doc.createElement('style')
            let cssStr = `
                @-webkit-keyframes coco-loading{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes coco-loading{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes cocoFadeIn{0%{opacity:0}to{opacity:1}}@keyframes cocoFadeIn{0%{opacity:0}to{opacity:1}}@-webkit-keyframes cocoFadeOut{0%{opacity:1}to{opacity:0}}@keyframes cocoFadeOut{0%{opacity:1}to{opacity:0}}@-webkit-keyframes cocoZoomIn{0%{-webkit-transform:scale3d(.25,.25,.25);transform:scale3d(.25,.25,.25);opacity:0}to{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1);opacity:1}}@keyframes cocoZoomIn{0%{-webkit-transform:scale3d(.25,.25,.25);transform:scale3d(.25,.25,.25);opacity:0}to{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1);opacity:1}}@-webkit-keyframes cocoZoomOut{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1);opacity:1}to{-webkit-transform:scale3d(.1,.1,.1);transform:scale3d(.1,.1,.1);opacity:0}}@keyframes cocoZoomOut{0%{-webkit-transform:scale3d(1,1,1);transform:scale3d(1,1,1);opacity:1}to{-webkit-transform:scale3d(.1,.1,.1);transform:scale3d(.1,.1,.1);opacity:0}}[class|=coco],[class|=coco]::after,[class|=coco]::before{box-sizing:border-box;outline:0}.coco-modal-mask,.coco-modal-wrapper{position:fixed;width:100%;height:100%;top:0;left:0}.coco-modal-wrapper{right:0;bottom:0;overflow:auto;-webkit-overflow-scrolling:touch;z-index:2020}.coco-modal-mask{background-color:rgba(0,0,0,.425);z-index:2008}.coco-modal-mask.blur{-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);background-color:rgba(0,0,0,.5)}.coco-modal{position:relative;margin:0 auto;top:15vh;outline:0;width:500px;-webkit-transform:translateZ(0);transform:translateZ(0)}.coco-modal-content{border-radius:6px;box-shadow:0 0 1px 0 rgba(0,0,0,.08),0 0 5px 0 rgba(0,0,0,.08);background-color:#fff}.coco-modal-content.coco-no-shadow{box-shadow:none}.fade-enter,.fade-leave{-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation-play-state:paused;animation-play-state:paused;-webkit-animation-timing-function:linear;animation-timing-function:linear;-webkit-animation-duration:.14s;animation-duration:.14s;transition:none;pointer-events:none;-webkit-transform:translateZ(0);transform:translateZ(0);will-change:opacity}.fade-enter{opacity:0}.fade-leave{-webkit-animation-delay:.08s;animation-delay:.08s}.fade-enter.fade-enter-active{-webkit-animation-name:cocoFadeIn;animation-name:cocoFadeIn;-webkit-animation-play-state:running;animation-play-state:running}.fade-leave.fade-leave-active,.zoom-enter.zoom-enter-active,.zoom-leave.zoom-leave-active{-webkit-animation-name:cocoFadeOut;animation-name:cocoFadeOut;-webkit-animation-play-state:running;animation-play-state:running}.zoom-enter{-webkit-animation-duration:.3s;animation-duration:.3s}.zoom-enter,.zoom-leave{-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation-play-state:paused;animation-play-state:paused;transition:none;pointer-events:none;-webkit-transform:translateZ(0);transform:translateZ(0);will-change:opacity,transform}.zoom-enter{-webkit-animation-delay:.08s;animation-delay:.08s;opacity:0;-webkit-animation-timing-function:cubic-bezier(.08,.8,.18,1);animation-timing-function:cubic-bezier(.08,.8,.18,1)}.zoom-enter.zoom-enter-active,.zoom-leave.zoom-leave-active{-webkit-animation-name:cocoZoomIn;animation-name:cocoZoomIn}.zoom-leave{-webkit-animation-duration:.28s;animation-duration:.28s;-webkit-animation-timing-function:cubic-bezier(.52,.3,.06,1);animation-timing-function:cubic-bezier(.52,.3,.06,1)}.zoom-leave.zoom-leave-active{-webkit-animation-name:cocoZoomOut;animation-name:cocoZoomOut}.rt-modal-title{position:relative;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.coco-modal-close{position:absolute;width:25px;height:25px;right:15px;top:15px;z-index:1;cursor:pointer}.coco-modal-close::after,.coco-modal-close::before{content:'';position:absolute;left:50%;top:50%;-webkit-transform:translate(-50%,-50%) rotate(-45deg);transform:translate(-50%,-50%) rotate(-45deg);width:2px;height:13px;background-color:#a5a5a5;transition:all .15s ease-out;display:block;border-radius:2px}.coco-modal-close::after{-webkit-transform:translate(-50%,-50%) rotate(45deg);transform:translate(-50%,-50%) rotate(45deg)}.coco-modal-close:hover::after,.coco-modal-close:hover::before{background-color:#646464}.coco-modal-close:active::after,.coco-modal-close:active::before{background-color:#010000}.coco-modal-body,.coco-modal-header{position:relative;font-size:18px;color:#000002;padding:18px}.coco-modal-body{padding:20px 18px;font-size:14px;color:#666667;overflow:auto}.coco-modal-footer{position:relative;text-align:right;padding:18px}.coco-btn{font-size:14px;text-decoration:none;padding:6px 22px;white-space:nowrap;border-radius:6px;font-weight:600;display:inline-block;cursor:pointer;border:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;outline:0}.coco-btn.cancel{margin-left:10px;color:#504949;background-color:transparent;font-weight:500}.coco-btn,.coco-btn span,.coco-loading{position:relative}.coco-btn.ok{background-color:#4285ff;color:#fff}.coco-btn.ok::before{content:'';position:absolute;top:0;left:0;width:100%;height:100%;border-radius:inherit;transition:all .16s ease-out;background-color:transparent}.coco-btn.ok:hover::before{background-color:rgba(0,0,0,.08)}.coco-btn.ok:active::before{transition:all .05s ease;background-color:rgba(0,0,0,.16)}.coco-btn.ok.coco-is-loading::before{background-color:transparent}.coco-loading{width:14px;height:14px;border:3px solid #fff;border-top:3px solid transparent;border-radius:7px;margin-right:7px;display:none;-webkit-animation:coco-loading 1s linear infinite;animation:coco-loading 1s linear infinite}.coco-is-loading{cursor:not-allowed}.coco-hidden{visibility:hidden}.coco-input{margin:14px 0;width:100%;height:39px;border-radius:6px;padding:7px 15px;font-weight:400;-webkit-appearance:none;-moz-appearance:none;appearance:none;color:#333;background-color:#f3f3f4;outline:0;border:1px solid transparent;font-size:14px;box-shadow:0 0 0 0 rgba(53,120,229,.1);transition:all .16s ease-out;line-height:20px}.coco-input::-webkit-input-placeholder{line-height:24px;color:#a2a2a3}.coco-input::-moz-placeholder{line-height:24px;color:#a2a2a3}.coco-input:-ms-input-placeholder,.coco-input::-ms-input-placeholder{line-height:24px;color:#a2a2a3}.coco-input::placeholder{line-height:24px;color:#a2a2a3}.coco-input:hover{transition:all .1s ease-out;background-color:#fff;box-shadow:0 0 0 1px rgba(66,133,255,.25);border-color:rgba(66,133,255,.5)}.coco-input:focus{background-color:#fff;box-shadow:0 0 0 1px rgba(66,133,255,.25);border-color:rgba(66,133,255,.5)}.coco-input:active{transition:all .08s ease-out;background-color:#fff;border-color:#cbcbcc;box-shadow:0 0 0 0 rgba(66,133,255,.125)}.coco-error-text{font-size:14px;color:#e71e63;margin:5px 10px}
            `;
            addSomeEvents()
            css.innerHTML = cssStr
            if (head.children.length) {
                head.insertBefore(css, head.children[0])
            } else {
                head.appendChild(css)
            }
        }
    }

    return coco
}));