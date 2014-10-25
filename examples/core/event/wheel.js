define(function (require) {
    'use strict';

    var event = require('/src/core/event/wheel.js');
    var ret1 = document.getElementById('ret1');
    var ret2 = document.getElementById('ret2');
    var ret3 = document.getElementById('ret3');
    var demo = document.getElementById('demo');

    event.on(demo, 'wheelstart', function (eve) {
        ret1.innerHTML = 'event = on' + eve.type + '; ' + 'time = ' + Date.now();
    });

    event.on(demo, 'wheelchange', function (eve) {
        ret2.innerHTML = 'event = on' + eve.type + '; eve.alienDetail.deltaY = ' + eve.alienDetail.deltaY + '; ' + 'time = ' +  Date.now();
    });

    event.on(demo, 'wheelend', function (eve) {
        ret3.innerHTML = 'event = on' + eve.type + '; ' + 'time = ' +  Date.now();
    });
});