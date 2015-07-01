/*!
 * 鼠标滚轮事件
 * @author ydr.me
 * @create 2014-10-07 14:45
 */


define(function (require, exports, module) {
    /**
     * 扩展滚轮事件
     * @module core/event/wheel
     * @requires core/event/base
     *
     * @example
     * event.on(ele, 'wheelstart', function(eve){});
     * event.on(ele, 'wheelchange', function(eve){
     *     // 滚轮的距离在 eve.alienDetail 里
     *     // eve.alienDetail.deltaY < 0 ? 向下滚轮 ：向上滚轮
     * });
     * event.on(ele, 'wheelend', function(eve){});
     */
    'use strict';

    var event = require('./base.js');
    var mousewheel = 'wheel mousewheel DOMMouseScroll MozMousePixelScroll';
    var timeout = 100;
    var timeid = 0;
    var isStart = false;

    event.on(document, mousewheel, function (eve) {
        var startEvent = event.create('wheelstart');
        var changeEvent = event.create('wheelchange');
        var endEvent = event.create('wheelend');
        var ele = eve.target;
        var deltaY = 0;
        var dispatchStart;
        var dispatchChange;

        clearTimeout(timeid);
        timeid = setTimeout(function () {
            event.dispatch(ele, endEvent, eve, {
                deltaX: 0,
                deltaY: deltaY,
                deltaZ: 0
            });
            isStart = false;
        }, timeout);

        if (!isStart) {
            isStart = true;
            dispatchStart = event.dispatch(ele, startEvent, eve, {
                deltaX: 0,
                deltaY: deltaY,
                deltaZ: 0
            });

            if (dispatchStart.defaultPrevented === true) {
                eve.preventDefault();
            }
        }

        // chrome
        if ('wheelDeltaY' in eve) {
            deltaY = eve.wheelDeltaY > 0 ? 1 : -1;
        }
        // ie9/firefox
        else if ('deltaY' in eve) {
            deltaY = eve.deltaY > 0 ? -1 : 1;
        }
        // ie8/ie7/ie6
        else if ('wheelDelta' in eve) {
            deltaY = eve.wheelDelta > 0 ? 1 : -1;
        }

        dispatchChange = event.dispatch(ele, changeEvent, eve, {
            deltaX: 0,
            deltaY: deltaY,
            deltaZ: 0
        });

        if (dispatchChange.defaultPrevented === true) {
            eve.preventDefault();
        }
    });

    module.exports = event;
});