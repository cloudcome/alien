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
    var typeis = require('../../util/typeis.js');
    var dato = require('../../util/dato.js');
    var domSelector = require('../../core/dom/selector.js');
    var touchstart = 'touchstart MSPointerDown pointerdown';
    var touchmove = 'touchmove MSPointerMove pointermove';
    var touchend = 'touchend MSPointerUp pointerup';
    var touchcancel = 'touchcancel MSPointerCancel pointercancel';
    var touchEvents = ['tap', 'taphold'];
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
    var regSpace = /\s+/g;
    var oldOn = event.on;
    
    event.on = function ($ele, eventType, selector, listener, isCapture) {
        var args = arguments;
        var argL = args.length;
        var eventTypes = String(eventType).trim().split(regSpace);
        
        isCapture = args[argL - 1];

        if (typeis(isCapture) !== 'boolean') {
            isCapture = false;
        }
        
        // on self
        // .on(body, 'click', fn);
        if (typeis(args[2]) === 'function') {
            listener = args[2];
            
            dato.each(eventTypes, function (index, etype) {
                if(touchEvents.indexOf(etype) === -1){
                    oldOn($ele, etype, listener, isCapture);
                }
            });
        }
        // delegate
        // .on(body, 'click', 'p', fn)
        else if (typeis(listener) === 'function') {
            dato.each(eventTypes, function (index, etype) {
                if(touchEvents.indexOf(etype) === -1){
                    oldOn($ele, etype, selector, listener, isCapture);
                }
            });
        }
    };
    
    module.exports = event;
});