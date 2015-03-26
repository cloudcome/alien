define(function (require) {
    'use strict';

    var Animation = require('../../src/libs/Animation.js');
    var keyframes = require('../../src/utils/keyframes.js');
    var $start = document.getElementById('start');
    var $ret1 = document.getElementById('ret1');
    var $ret2 = document.getElementById('ret2');
    var $demo1 = document.getElementById('demo1');
    var $demo2 = document.getElementById('demo2');
    var $demo3 = document.getElementById('demo3');
    var $demo4 = document.getElementById('demo4');
    var $demo5 = document.getElementById('demo5');

    var zhuan1 = keyframes({
        0: {
            scale: 1,
            rotate: 0,
            opacity: 1
        },
        0.3: {
            scale: 1.2,
            rotate: -15,
            opacity: 0.5
        },
        0.7: {
            scale: 0.8,
            rotate: 15,
            opacity: 0.5
        },
        1: {
            scale: 1,
            rotate: 0,
            opacity: 1
        }
    });

    var an = new Animation();

    an.push([$demo1, $demo2, $demo3, $demo4, $demo5], {
        opacity: 0
    }, {duration: 10});
    an.push($demo1, {opacity: 1}, {duration: 100});
    an.push($demo2, {opacity: 1}, {duration: 100, delay: 30});
    an.push($demo3, {opacity: 1}, {duration: 100, delay: 60});
    an.push($demo4, {opacity: 1}, {duration: 100, delay: 90});
    an.push($demo5, {opacity: 1}, {duration: 100, delay: 120});
    an.push($demo5, zhuan1, {duration: 1000});
    an.push([$demo1, $demo2, $demo3, $demo4, $demo5], zhuan1, {duration: 1000});

    $start.onclick = function () {
        an.start(3);
    };

    an.on('change', function (index, times) {
        $ret1.innerHTML = '第' + times + '次第' + (index + 1) + '帧动画';
    });

    an.on('end', function () {
        $ret2.innerHTML = '动画队列完成';
    });
});