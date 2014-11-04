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
     * @requires util/data
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
    var data = require('../../util/data.js');
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
            timeout: 500,
            event: event.create('tap')
        },
        taphold: {
            x: 30,
            y: 30,
            timeout: 750,
            event: event.create('taphold')
        },
        swipe: {
            x: 30,
            y: 30,
            event: event.create('swipe')
        },
        swipeup: {
            event: event.create('swipeup')
        },
        swiperight: {
            event: event.create('swiperight')
        },
        swipedown: {
            event: event.create('swipedown')
        },
        swipeleft: {
            event: event.create('swipeleft')
        }
    };
    var x0;
    var y0;
    var t0;
    var timeid;

    event.on(document, touchstart, function (eve) {
        var firstTouch;
        var target;

        if (eve.touches && eve.touches.length === 1) {
            attribute.css(body, 'touch-callout', 'none');
            attribute.css(body, 'user-select', 'none');
            firstTouch = eve.touches[0];
            target = eve.target;
            x0 = firstTouch.clientX;
            y0 = firstTouch.clientY;
            t0 = Date.now();

            timeid = setTimeout(function () {
                event.extend(options.taphold.event, firstTouch);
                event.dispatch(target, options.taphold.event);
            }, options.taphold.timeout);
        }
    });

    event.on(document, touchmove, function (eve) {
        var firstTouch;
        var target;
        var deltaX;
        var deltaY;
        var rect;

        if (eve.touches && eve.touches.length === 1) {
            firstTouch = eve.touches[0];
            target = firstTouch.target;
            deltaX = Math.abs(firstTouch.clientX - x0);
            deltaY = Math.abs(firstTouch.clientY - y0);
            rect = target.getBoundingClientRect();

            // 在元素范围
            if (firstTouch.clientX > rect.left && firstTouch.clientY > rect.top && firstTouch.clientX < rect.right && firstTouch.clientY < rect.bottom) {
                if (timeid && (deltaX > options.taphold.x || deltaY > options.taphold.y)) {
                    _reset(eve);
                }
            }
        }
    });

    event.on(document, touchend, function (eve) {
        _reset(eve);

        var firstTouch;
        var x1;
        var y1;
        var x;
        var y;
        var deltaX;
        var deltaY;
        var deltaT;
        var target;

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

            if (deltaX < options.tap.x && deltaY < options.tap.y && deltaT < options.tap.timeout) {
                event.extend(options.tap.event, firstTouch);
                event.dispatch(target, options.tap.event);
            }

            if (deltaX >= options.swipe.x || deltaY >= options.swipe.y) {
                setTimeout(function () {
                    var dir = deltaX > deltaY ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');

                    event.extend(options.swipe.event, firstTouch, {
                        direction: dir
                    });
                    event.extend(options['swipe' + dir].event, firstTouch);

                    event.dispatch(target, options.swipe.event);
                    event.dispatch(target, options['swipe' + dir].event);
                }, 0);
            }
        }
    });

    event.on(document, touchcancel, _reset);

    event.on(window, 'scroll', _reset);


    /**
     * 重置定时器
     * @param {Event} eve 事件对象
     * @private
     */
    function _reset(eve) {
        if (eve.changedTouches && eve.changedTouches.length === 1 || eve.touches && eve.touches.length === 1) {
            if (timeid) {
                clearTimeout(timeid);
            }
            timeid = 0;
        }
    }


    /**
     * 出口
     * @type {*|exports}
     */
    module.exports = event;
});