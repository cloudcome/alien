define(function (require) {
    var event = require('/src/core/event/drag.js');
    var demo1 = document.getElementById('demo1');
    var demo2 = document.getElementById('demo2');
    var demo3 = document.getElementById('demo3');
    var times = 1;

    event.on(demo2, 'dragstart', function (eve) {
        times++;
        if (times > 2) {
            eve.preventDefault();
        }
    });

    event.on(demo2, 'drag', function (eve) {
        if(eve.clientX > 430){
            eve.preventDefault();
        }
    });

    event.on(demo2, 'dragend', function (eve) {
        eve.preventDefault();
    });
});