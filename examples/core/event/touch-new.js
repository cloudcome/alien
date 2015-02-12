define(function (require) {
    'use strict';

    var event = require('../../../src/core/event/touch.js');
    var demo1 = document.getElementById('demo1');
    var demo2 = document.getElementById('demo2');

    event.on(demo1, 'click', function () {
        window.alert(123);
    });

    event.on(demo2, 'tap', function () {
        demo2.style.display = 'none';
        return false;
    });

    //var inTouch = false;
    //var touchStartTime;
    //
    //event.on(demo2, 'touchstart', function () {
    //    touchStartTime = Date.now();
    //    inTouch = true;
    //});
    //
    //event.on(demo2, 'touchmove', function () {
    //});
    //
    //event.on(demo2, 'touchend', function () {
    //    if(inTouch && Date.now() - touchStartTime < 100){
    //        inTouch = false;
    //        demo2.style.display = 'none';
    //    }
    //});
});