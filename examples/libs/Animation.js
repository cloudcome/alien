define(function (require) {
    'use strict';

    var Animation = require('../../src/libs/Animation.js');
    var keyframes = require('../../src/util/keyframes.js');
    var $start = document.getElementById('start');
    var $ret1 = document.getElementById('ret1');
    var $ret2 = document.getElementById('ret2');
    var $demo1 = document.getElementById('demo1');
    var $demo2 = document.getElementById('demo2');
    var $demo3 = document.getElementById('demo3');
    var $demo4 = document.getElementById('demo4');
    var $demo5 = document.getElementById('demo5');

    var pop = keyframes({
        0: {
            scale: 0.8,
            rotate: 30,
            opacity: 1
        },
        0.5: {
            scale: 1.2,
            rotate: -15,
            opacity: .5
        },
        1: {
            scale: 1,
            rotate: 0,
            opacity: 0
        }
    });

    var an = new Animation();

    an.push($demo1, {opacity: 1}, {duration: 300});
    an.push($demo2, {opacity: 1}, {duration: 300, delay: 400});
    an.push($demo3, {opacity: 1}, {duration: 300, delay: 400});
    an.push($demo4, {opacity: 1}, {duration: 300, delay: 400});
    an.push($demo5, {opacity: 1}, {duration: 300, delay: 400});
    an.push($demo5, pop, {duration: 600});
    an.push([$demo1, $demo2, $demo3, $demo4, $demo5], pop, {duration: 600});

    $start.onclick = function () {
        an.start();
    };

    an.on('change', function (index, times) {
        $ret1.innerHTML = '第' + times + '次第' + (index + 1) + '帧动画';
    });

    an.on('end', function () {
        $ret2.innerHTML = '动画队列完成';


    });
});