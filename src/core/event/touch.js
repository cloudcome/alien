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
     * @requires util/controller
     *
     * @example
     * event.on(ele, 'touch1start', fn);
     * event.on(ele, 'touch1move', fn);
     * event.on(ele, 'touch1end', fn);
     * event.on(ele, 'touch1cancel', fn);
     * event.on(ele, 'tap', fn);
     * event.on(ele, 'dbltap', fn);
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
    var controller = require('../../util/controller.js');
    var touchstart = 'touchstart MSPointerDown pointerdown';
    var touchmove = 'touchmove MSPointerMove pointermove';
    var touchend = 'touchend MSPointerUp pointerup';
    var touchcancel = 'touchcancel MSPointerCancel pointercancel';
    var udf;
    var options = {
        //minX: 30,
        //minY: 30,
        //tapTimeout: 300,
        //holdTimeout: 300,
        //swipeTimeout: 300,
        tap: {
            x: 30,
            y: 30,
            timeout: 250
        },
        taphold: {
            x: 50,
            y: 50,
            timeout: 600
        },
        swipe: {
            x: 50,
            y: 50,
            timeout: 250
        }
    };
    var cssTouch;
    /**
     * @type {Object}
     * @property startX {Number} 开始触摸时的 x 坐标
     * @property startY {Number} 开始触摸时的 y 坐标
     * @property startTime {Number} 开始触摸时的时间戳
     * @property startID {Number} 开始触摸时的 ID
     * @property startTarget {Object} 开始触摸时的 element
     * @property moveX {Number} 触摸过程中的 x 坐标
     * @property moveY {Number} 触摸过程中的 y 坐标
     * @property moveTime {Number} 触摸过程中的时间戳
     * @property moveID {Number} 触摸过程中的 ID
     * @property moveTarget {Object} 触摸过程中的 element
     * @property moveDirection {String} 触摸过程中的矢量主方向
     * @property endX {Number} 触摸结束时的 x 坐标
     * @property endY {Number} 触摸结束时的 y 坐标
     * @property endID {Number} 触摸结束时的 ID
     * @property endTarget {Object} 触摸结束时的 element
     * @property endTime {Number} 触摸结束时的时间戳
     * @property changedX {Number} 触摸改变的 x 位移
     * @property changedY {Number} 触摸改变的 y 位移
     * @property changedDirection {String} 触摸改变的矢量主方向
     * @property deltaX {Number} 触摸改变的 x 距离
     * @property deltaY {Number} 触摸改变的 y 距离
     * @property tapholdTimeid {Number} 长触定时器
     */
    var touch = {};


    event.on(document, touchstart, function (eve) {
        if (!eve.touches || eve.touches.length !== 1) {
            return;
        }

        cssTouch = attribute.css(document.body, ['touch-callout', 'user-select']);
        attribute.css(document.body, {
            'touch-callout': 'none',
            'user-select': 'none'
        });

        var firstTouch = eve.touches[0];

        _reset('taphold');
        touch = {
            lastTime: touch.lastTime
        };
        touch.startX = firstTouch.pageX;
        touch.startY = firstTouch.pageY;
        touch.startTime = eve.timeStamp || Date.now();
        touch.startID = firstTouch.identifier;
        touch.startTarget = firstTouch.target;

        var touch1startEvent = event.create('touch1start');

        event.extend(touch1startEvent, firstTouch, touch);

        var dispatchTouch1start = event.dispatch(touch.startTarget, touch1startEvent);

        if (dispatchTouch1start && dispatchTouch1start.defaultPrevented === true) {
            eve.preventDefault();
        }

        touch.tapholdTimeid = setTimeout(function () {
            var tapholdEvent = event.create('taphold');

            touch.tapholdTimeid = 0;
            event.extend(tapholdEvent, firstTouch, touch);

            var dispatchTaphold = event.dispatch(touch.startTarget, tapholdEvent);

            if (dispatchTaphold && dispatchTaphold.defaultPrevented === true) {
                eve.preventDefault();
            }
        }, options.taphold.timeout);
    });

    event.on(document, touchmove, function (eve) {
        if (!eve.touches || eve.touches.length !== 1) {
            return;
        }

        var firstTouch = eve.touches[0];

        touch.moveX = firstTouch.pageX;
        touch.moveY = firstTouch.pageY;
        touch.moveTime = eve.timeStamp || Date.now();
        touch.moveID = firstTouch.identifier;
        touch.moveTarget = firstTouch.target;
        touch.changedX = touch.moveX - touch.startX;
        touch.changedY = touch.moveY - touch.startY;
        touch.deltaX = Math.abs(touch.changedX);
        touch.deltaY = Math.abs(touch.changedY);
        touch.moveDirection = _calDirection();

        // 移动距离大于 taphold
        if (touch.deltaX > options.taphold.x || touch.deltaY > options.taphold.y) {
            _reset('taphold');
        }

        var touch1moveEvent = event.create('touch1move');

        event.extend(touch1moveEvent, firstTouch, touch);

        var dispatchTouch1move = event.dispatch(touch.startTarget, touch1moveEvent);

        if (dispatchTouch1move && dispatchTouch1move.defaultPrevented === true) {
            eve.preventDefault();
        }
    });

    event.on(document, touchend, function (eve) {
        if (!eve.changedTouches || eve.changedTouches.length !== 1) {
            return;
        }

        var firstTouch = eve.changedTouches[0];

        touch.moveTime = touch.moveTime === udf ? touch.startTime : touch.moveTime;
        touch.moveX = touch.moveX === udf ? touch.startX : touch.moveX;
        touch.moveY = touch.moveY === udf ? touch.startY : touch.moveY;
        touch.moveID = touch.moveID === udf ? touch.startID : touch.moveID;
        touch.moveTarget = touch.moveTarget === udf ? touch.startTarget : touch.moveTarget;
        touch.moveAngle = touch.moveAngle === udf ? 0 : touch.moveAngle;
        touch.moveDirection = touch.moveDirection === udf ? 'none' : touch.moveDirection;
        touch.endX = firstTouch.pageX;
        touch.endY = firstTouch.pageY;
        touch.endTime = eve.timeStamp || Date.now();
        touch.endID = firstTouch.identifier;
        touch.endTarget = firstTouch.target;
        touch.changedX = touch.endX - touch.startX;
        touch.changedY = touch.endY - touch.startY;
        touch.deltaX = Math.abs(touch.changedX);
        touch.deltaY = Math.abs(touch.changedY);
        touch.changedDirection = _calDirection();
        touch.deltaTime = touch.endTime - touch.startTime;

        // 触发 tap
        if (
            touch.deltaTime < options.tap.timeout &&
            touch.deltaX < options.tap.x &&
            touch.deltaY < options.tap.y &&
            touch.startID === touch.endID &&
            touch.startTarget === touch.endTarget
        ) {
            controller.nextTick(function () {
                var tapEvent = event.create('tap');

                event.extend(tapEvent, firstTouch, touch);

                var dispatchTap = event.dispatch(touch.startTarget, tapEvent);

                if (dispatchTap && dispatchTap.defaultPrevented === true) {
                    eve.preventDefault();
                }
            });
        }

        // 移动距离大于 taphold || 时间不够
        if (touch.deltaX > options.taphold.x || touch.deltaY > options.taphold.y || touch.deltaTime < options.taphold.timeout) {
            _reset('taphold');
        }

        // 触发 swipe
        if (touch.changedDirection !== 'none' &&
            touch.deltaX > options.swipe.x || touch.deltaY > options.swipe.y
        ) {
            var swipeEvent = event.create('swipe');

            event.extend(swipeEvent, firstTouch, touch);

            var dispatchSwipe = event.dispatch(touch.startTarget, swipeEvent);

            if (dispatchSwipe && dispatchSwipe.defaultPrevented === true) {
                eve.preventDefault();
            }

            var swipedirectionEvent = event.create('swipe' + touch.changedDirection);

            event.extend(swipedirectionEvent, firstTouch, touch);

            var dispatchSwipedirection = event.dispatch(touch.startTarget, swipedirectionEvent);

            if (dispatchSwipedirection && dispatchSwipedirection.defaultPrevented === true) {
                eve.preventDefault();
            }
        }

        touch.lastTime = touch.endTime;
        _cancel(eve);
    });

    event.on(document, touchcancel, _cancel);
    event.on(window, 'scroll', _cancel);


    /**
     * 取消 touch 事件检测
     * @param {Event} [eve] 事件对象
     * @private
     */
    function _cancel(eve) {
        attribute.css(document.body, cssTouch);

        if (!touch.startTarget) {
            return;
        }

        var firstTouch = eve && eve.touches && eve.touches[0] ||
            eve && eve.changedTouches && eve.changedTouches[0];
        var touch1endEvent = event.create('touch1end');

        event.extend(touch1endEvent, firstTouch, touch);

        var dispatchTouch1end = event.dispatch(touch.startTarget, touch1endEvent);

        if (dispatchTouch1end && dispatchTouch1end.defaultPrevented === true) {
            eve.preventDefault();
        }
    }


    /**
     * 重置定时器
     * @param {String} key
     * @private
     */
    function _reset(key) {
        key += 'Timeid';
        if (touch[key]) {
            clearTimeout(touch[key])
            touch[key] = 0;
        }
    }


    /**
     * 计算触摸方向
     * @returns {string}
     * @private
     */
    function _calDirection() {
        if (touch.deltaX === 0 && touch.deltaY === 0) {
            return 'none';
        }

        return touch.deltaX > touch.deltaY ?
            (touch.changedX > 0 ? 'right' : 'left') :
            (touch.changedY > 0 ? 'down' : 'up');
    }


    /**
     * 出口
     * @type {*|exports}
     */
    module.exports = event;
});