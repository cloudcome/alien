define(function (require) {
    'use strict';

    var event = require('/src/core/event/base.js');
    var demo = document.getElementById('demo');
    var demo2 = document.getElementById('demo2');
    var ret1 = document.getElementById('ret1');
    var ret2 = document.getElementById('ret2');

    require('/src/core/event/touch.js');

    event.on(demo, 'tap', function (eve) {
        ret1.innerHTML += 'tap it<br>';
        demo.style.display = 'none';
        console.log(eve);
        eve.stopPropagation();
    });

    event.on(demo2, 'click', function (eve) {
        ret1.innerHTML += 'click demo2';
        console.log(eve);
    });

    event.on(demo, 'swipe', function (eve) {
        ret1.innerHTML += 'swipe it';
        console.log(eve);
    });

    event.on(demo, 'swipeup', function () {
        ret2.innerHTML += 'swipeup it';
    });

    event.on(demo, 'swiperight', function () {
        ret2.innerHTML += 'swiperight it';
    });

    event.on(demo, 'swipedown', function () {
        ret2.innerHTML = 'swipedown it';
    });

    event.on(demo, 'swipeleft', function () {
        ret2.innerHTML = 'swipeleft it';
    });

    event.on(demo, 'taphold', function () {
        ret1.innerHTML = 'taphold it';
    });
});