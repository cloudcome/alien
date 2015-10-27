/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-08-26 20:56
 */


define(function (require, exports, module) {
    /**
     * @module ui/touch/
     * @requires utils/class
     * @requires utils/dato
     * @requires core/dom/attribute
     * @requires core/event/touch
     */

    'use strict';

    var ui = require('../index.js');
    var controller = require('../../utils/controller.js');
    var dato = require('../../utils/dato.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var udf;
    var defaults = {
        tap: {
            x: 30,
            y: 30,
            timeout: 150
        },
        dbltap: {
            timeout: 300
        },
        taphold: {
            x: 50,
            y: 50,
            timeout: 500
        },
        swipe: {
            x: 50,
            y: 50,
            timeout: 250
        },
        // 是否包含鼠标事件
        includeMouse: true,
        // 是否阻止弹出菜单
        preventCallout: true,
        // 是否取消默认
        preventDefault: false,
        // 是否在滚动时取消事件
        cancalOnScroll: true
    };
    var isMobile = /mobile|phone|pad|pod/i.test(navigator.userAgent);
    var Touch = ui.create({
        constructor: function ($ele, options) {
            var the = this;

            the._$ele = selector.query($ele)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._touch = {};
            the.className = 'touch';
            the._initEvent();
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;

            if (options.preventCallout) {
                attribute.css(the._$ele, {
                    touchCallout: 'none',
                    userSelect: 'none'
                });
            }

            var startEvent = isMobile ? 'touchstart MSPointerDown pointerdown' : (options.includeMouse ? 'mousedown' : '');
            var moveEvent = isMobile ? 'touchmove MSPointerMove pointermove' : (options.includeMouse ? 'mousemove' : '');
            var endEvent = isMobile ? 'touchend MSPointerUp pointerup' : (options.includeMouse ? 'mouseup' : '');
            var touchEvent = isMobile ? 'touchcancel MSPointerCancel pointercancel' : '';

            event.on(the._$ele, startEvent, the._onstart.bind(the));
            event.on(the._$ele, moveEvent, the._onmove.bind(the));
            event.on(the._$ele, endEvent, the._onend.bind(the));
            event.on(the._$ele, touchEvent, the._oncancel.bind(the));

            if (startEvent) {
                event.on(window, 'scroll', the._onscroll.bind(the));
            }
        },


        dispatch: function (type) {
            var the = this;
            var options = the._options;

            switch (type) {
                case 'tap':
                    event.dispatch(the._$ele, event.create('touchstart'));
                    setTimeout(function () {
                        event.dispatch(the._$ele, event.create('touchstart'));
                    });
                    break;
            }
        },


        /**
         * 获取第一个事件对象
         * @param eve
         * @param [isEnd]
         * @returns {*}
         * @private
         */
        _getEvent: function (eve, isEnd) {
            var the = this;
            var options = the._options;

            if (!eve) {
                return null;
            }

            if (isEnd && eve.changedTouches && eve.changedTouches.length) {
                return eve.changedTouches[0];
            } else if (eve.touches && eve.touches.length) {
                return eve.touches[0];
            }

            return options.includeMouse ? eve : null;
        },


        /**
         * 监听开始事件
         * @param eve
         * @private
         */
        _onstart: function (eve) {
            var the = this;
            var options = the._options;
            var touch = the._touch;
            var originalEvent = eve.originalEvent;

            if (options.preventDefault) {
                eve.preventDefault();
            }

            eve = the._getEvent(eve);

            if (!eve) {
                return;
            }

            the._startEvent = eve;
            touch.startX = eve.pageX;
            touch.startY = eve.pageY;
            touch.startTarget = eve.target;
            touch.startTime = Date.now();
            touch.startID = eve.identifier || 1;

            // 触发 taphold
            the._cancelTaphold();
            the._tapholdTimeid = setTimeout(function () {
                the.emit('taphold', dato.extend(originalEvent, {
                    alienDetail: touch
                }));
            }, options.taphold.timeout);
            the.emit('touch1start', dato.extend(originalEvent, {
                alienDetail: touch
            }));
        },


        /**
         * 监听移动事件
         * @param eve
         * @private
         */
        _onmove: function (eve) {
            var the = this;
            var options = the._options;
            var touch = the._touch;

            if (!the._startEvent) {
                return;
            }

            if (options.preventDefault) {
                eve.preventDefault();
            }

            var originalEvent = eve.originalEvent;
            eve = the._getEvent(eve);

            if (!eve) {
                return;
            }

            touch.moveX = eve.pageX;
            touch.moveY = eve.pageY;
            touch.moveTime = Date.now();
            touch.moveID = eve.identifier || 1;
            touch.moveTarget = eve.target;
            touch.changedX = eve.pageX - touch.startX;
            touch.changedY = eve.pageY - touch.startY;
            touch.deltaX = Math.abs(touch.changedX);
            touch.deltaY = Math.abs(touch.changedY);
            touch.moveDirection = the._calDirection(touch);

            // 移动距离大于 taphold
            if (touch.deltaX > options.taphold.x || touch.deltaY > options.taphold.y) {
                the._cancelTaphold();
            }

            the.emit('touch1move', dato.extend(originalEvent, {
                alienDetail: touch
            }));
        },


        /**
         * 监听结束事件
         * @param eve
         * @private
         */
        _onend: function (eve) {
            var the = this;
            var options = the._options;
            var touch = the._touch;

            if (!the._startEvent) {
                return;
            }

            if (options.preventDefault) {
                eve.preventDefault();
            }

            var originalEvent = eve.originalEvent;
            eve = the._getEvent(eve, true);

            if (!eve) {
                return;
            }

            the._startEvent = null;
            touch.moveTime = touch.moveTime === udf ? touch.startTime : touch.moveTime;
            touch.moveX = touch.moveX === udf ? touch.startX : touch.moveX;
            touch.moveY = touch.moveY === udf ? touch.startY : touch.moveY;
            touch.moveID = touch.moveID === udf ? touch.startID : touch.moveID;
            touch.moveTarget = touch.moveTarget === udf ? touch.startTarget : touch.moveTarget;
            touch.moveAngle = touch.moveAngle === udf ? 0 : touch.moveAngle;
            touch.moveDirection = touch.moveDirection === udf ? 'none' : touch.moveDirection;
            touch.endX = eve.pageX;
            touch.endY = eve.pageY;
            touch.endTime = Date.now();
            touch.endID = eve.identifier || 1;
            touch.endTarget = eve.target;
            touch.changedX = touch.endX - touch.startX;
            touch.changedY = touch.endY - touch.startY;
            touch.deltaX = Math.abs(touch.changedX);
            touch.deltaY = Math.abs(touch.changedY);
            touch.changedDirection = the._calDirection(touch);
            touch.deltaTime = touch.endTime - touch.startTime;

            // 触发 tap
            if (
                touch.deltaTime < options.tap.timeout &&
                touch.deltaX < options.tap.x &&
                touch.deltaY < options.tap.y &&
                touch.startID === touch.endID &&
                touch.startTarget === touch.endTarget
            ) {
                // 移动距离大于 taphold || 时间不够
                if (touch.deltaX > options.taphold.x || touch.deltaY > options.taphold.y || touch.deltaTime < options.taphold.timeout) {
                    the._cancelTaphold();
                }

                // 触发 tap
                the.emit('tap', dato.extend(originalEvent, {
                    alienDetail: touch
                }));

                // 触发 dbltap
                if (touch.endTime - touch.lastTime < options.dbltap.timeout) {
                    the.emit('dbltap', dato.extend(originalEvent, {
                        alienDetail: touch
                    }));
                }
            }

            // 触发 swipe
            if (touch.changedDirection !== 'none' &&
                touch.deltaX > options.swipe.x || touch.deltaY > options.swipe.y
            ) {
                the.emit('swipe', dato.extend(originalEvent, {
                    alienDetail: touch
                }));
                the.emit('swipe' + touch.changedDirection, dato.extend(originalEvent, {
                    alienDetail: touch
                }));
            }

            the.emit('touch1end', dato.extend(originalEvent, {
                alienDetail: touch
            }));
            touch.lastTime = touch.endTime;
        },


        /**
         * 监听取消事件
         * @param eve
         * @private
         */
        _oncancel: function (eve) {
            var the = this;
            var options = the._options;
            var touch = the._touch;

            if (!the._startEvent) {
                return;
            }

            the._startEvent = null;

            //var touch1endEvent = event.create('touch1end');
            //
            //event.extend(touch1endEvent, eve, touch);
            //
            //var dispatchTouch1end = event.dispatch(touch.startTarget, touch1endEvent);
            //
            //if (dispatchTouch1end && dispatchTouch1end.defaultPrevented === true) {
            //    eve.preventDefault();
            //}

            the.emit('touch1end', dato.extend(eve.originalEvent, {
                alienDetail: touch
            }));

            if (options.preventDefault) {
                eve.preventDefault();
            }
        },


        /**
         * 监听滚动
         * @private
         */
        _onscroll: function () {
            var the = this;
            var options = the._options;

            the._oncancel();
        },


        /**
         * 取消 taphold
         * @private
         */
        _cancelTaphold: function () {
            clearTimeout(this._tapholdTimeid);
        },

        /**
         * 计算触摸方向
         * @param touch
         * @returns {string}
         * @private
         */
        _calDirection: function (touch) {
            if (touch.deltaX === 0 && touch.deltaY === 0) {
                return 'none';
            }

            return touch.deltaX > touch.deltaY ?
                (touch.changedX > 0 ? 'right' : 'left') :
                (touch.changedY > 0 ? 'down' : 'up');
        }
    });

    Touch.defaults = defaults;

    module.exports = Touch;
});