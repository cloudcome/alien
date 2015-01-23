/*!
 * touch.js
 * @author ydr.me
 * @create 2014-09-27 16:07
 */


define(function (require, exports, module) {
    /**
     * 扩展触摸事件支持
     *
     * @module core/event/touch
     * @requires core/event/base
     * @requires core/dom/attribute
     *
     * @example
     * event.on(ele, 'tap', fn);
     * event.on(ele, 'taphold', fn);
     * event.on(ele, 'swipe', fn);
     * event.on(ele, 'swipeup', fn);
     * event.on(ele, 'swiperight', fn);
     * event.on(ele, 'swipebottom', fn);
     * event.on(ele, 'swipeleft', fn);
     */
    'use strict';

    var event = require('./base.js');
    var attribute = require('../dom/attribute.js');
    var body = document.body;
    var touchstart = 'touchstart MSPointerDown pointerdown';
    var touchmove = 'touchmove MSPointerMove pointermove';
    var touchend = 'touchend MSPointerUp pointerup';
    var touchcancel = 'touchcancel MSPointerCancel pointercancel';
//    var mustEventProperties = 'target detail which clientX clientY pageX pageY screenX screenY'.split(' ');
    var options = {
        tap: {
            x: 30,
            y: 30,
            timeout: 400
        },
        taphold: {
            x: 30,
            y: 30,
            timeout: 800
        },
        swipe: {
            x: 30,
            y: 30
        }
    };
    var x0;
    var y0;
    var t0;
    var tapTimer;
    var tapholdTimer;


    event.on(document, touchstart, function (eve) {
        var firstTouch;
        var target;
        var touch1Event;
        var dispatchTouch1;

        _reset(eve);

        if (eve.touches && eve.touches.length === 1) {
            attribute.css(body, 'touch-callout', 'none');
            attribute.css(body, 'user-select', 'none');
            firstTouch = eve.touches[0];
            target = eve.target;
            x0 = firstTouch.clientX;
            y0 = firstTouch.clientY;
            t0 = Date.now();

            tapTimer = setTimeout(function () {
                var tapEvent = event.create('tap');
                tapTimer = 0;
                event.extend(tapEvent, firstTouch);

                var dispatchTap = event.dispatch(target, tapEvent);

                if (dispatchTap && dispatchTap.defaultPrevented === true) {
                    eve.preventDefault();
                }
            }, options.tap.timeout);

            tapholdTimer = setTimeout(function () {
                var tapholdEvent = event.create('taphold');

                tapholdTimer = 0;
                event.extend(tapholdEvent, firstTouch);

                var dispatchTaphold = event.dispatch(target, tapholdEvent);

                if (dispatchTaphold && dispatchTaphold.defaultPrevented === true) {
                    eve.preventDefault();
                }
            }, options.taphold.timeout);

            touch1Event = event.create('touch1start');
            event.extend(touch1Event, firstTouch, {
                startX: x0,
                startY: y0
            });
            dispatchTouch1 = event.dispatch(target, touch1Event);

            if (dispatchTouch1.defaultPrevented === true) {
                eve.preventDefault();
            }
        }
    });

    event.on(document, touchmove, function (eve) {
        var firstTouch;
        var target;
        var deltaX;
        var deltaY;
        var rect;
        var touch1Event;
        var dispatchTouch1;

        if (eve.touches && eve.touches.length === 1) {
            firstTouch = eve.touches[0];
            target = firstTouch.target;
            deltaX = Math.abs(firstTouch.clientX - x0);
            deltaY = Math.abs(firstTouch.clientY - y0);
            rect = target.getBoundingClientRect();

            if (deltaX > options.tap.x || deltaY > options.tap.y) {
                _reset(eve, 'p');
            }

            // 在元素范围
            if (firstTouch.clientX > rect.left && firstTouch.clientY > rect.top && firstTouch.clientX < rect.right && firstTouch.clientY < rect.bottom) {
                if (deltaX > options.taphold.x || deltaY > options.taphold.y) {
                    _reset(eve, 'd');
                }
            } else {
                _reset(eve, 'd');
            }

            touch1Event = event.create('touch1move');
            event.extend(touch1Event, firstTouch, {
                moveX: firstTouch.clientX,
                moveY: firstTouch.clientY,
                deltaX: firstTouch.clientX - x0,
                deltaY: firstTouch.clientY - y0
            });
            dispatchTouch1 = event.dispatch(target, touch1Event);

            if (dispatchTouch1.defaultPrevented === true) {
                eve.preventDefault();
            }
        }
    });

    event.on(document, touchend, function (eve) {
        var firstTouch;
        var x1;
        var y1;
        var x;
        var y;
        var deltaX;
        var deltaY;
        var deltaT;
        var target;
        var touch1Event;
        var dispatchTouch1;
        var dispatchSwipe;
        var dispatchSwipedir;

        if (eve.changedTouches && eve.changedTouches.length === 1) {
            firstTouch = eve.changedTouches[0];
            x1 = firstTouch.clientX;
            y1 = firstTouch.clientY;
            x = x1 - x0;
            y = y1 - y0;
            deltaX = Math.abs(x);
            deltaY = Math.abs(y);
            deltaT = Date.now() - t0;
            target = firstTouch.target;

            if (deltaX > options.tap.x || deltaY > options.tap.y || deltaT < options.taphold.timeout) {
                _reset(eve, 'd');
            }

            if (deltaX >= options.swipe.x || deltaY >= options.swipe.y) {
                var dir = deltaX > deltaY ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');
                var swipeDirEvent = event.create('swipe' + dir);
                var swipeEvent = event.create('swipe');

                event.extend(swipeDirEvent, firstTouch, {
                    direction: dir
                });
                event.extend(swipeEvent, firstTouch);

                dispatchSwipe = event.dispatch(target, swipeEvent);
                dispatchSwipedir = event.dispatch(target, swipeDirEvent);
            }

            touch1Event = event.create('touch1end');
            event.extend(touch1Event, firstTouch, {
                endX: x1,
                endY: y1,
                deltaX: x,
                deltaY: y
            });
            dispatchTouch1 = event.dispatch(target, touch1Event);

            if (dispatchSwipe && dispatchSwipe.defaultPrevented === true ||
                dispatchSwipedir && dispatchSwipedir.defaultPrevented === true ||
                dispatchTouch1.defaultPrevented === true) {
                eve.preventDefault();
            }
        }
    });

    event.on(document, touchcancel, _reset);

    event.on(window, 'scroll', _reset);


    /**
     * 重置定时器
     * @param {Event} eve 事件对象
     * @param {String} [type="pd"] tap taphold
     * @private
     */
    function _reset(eve, type) {
        type = type || 'pd';

        if (eve.changedTouches && eve.changedTouches.length === 1 || eve.touches && eve.touches.length === 1) {
            if (tapTimer && type.indexOf('p') > -1) {
                clearTimeout(tapTimer);
                tapTimer = 0;
            }

            if (tapholdTimer && type.indexOf('d') > -1) {
                clearTimeout(tapholdTimer);
                tapholdTimer = 0;
            }
        }
    }


    /**
     * 出口
     * @type {*|exports}
     */
    module.exports = event;
});