/*!
 * touch.js
 * @author ydr.me
 * @create 2014-09-27 16:07
 */


define(function (require) {
    /**
     * @module core/event/touch
     */
    'use strict';

    var event = require('./base.js');
    var touchstart = 'touchstart MSPointerDown pointerdown';
    var touchmove = 'touchmove MSPointerMove pointermove';
    var touchend = 'touchend MSPointerUp pointerup';
    var touchcancel = 'touchcancel MSPointerCancel pointercancel';
    var options = {
        tap: {
            x: 30,
            y: 30,
            timeout: 500
        },
        taphold: {
            x: 30,
            y: 30,
            timeout: 750
        },
        swipe: {
            x: 30,
            y: 30
        }
    };

    event.on(document, touchstart, function (eve) {
        var firstTouch;

        if(eve.touches && eve.touches.length === 1){
            return !1;
        }
    });
});