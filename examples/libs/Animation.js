define(function (require) {
    'use strict';

    var Animation = require('../../src/libs/Animation.js');
    var keyframes = require('../../src/util/keyframes.js');
    var $start = document.getElementById('start');
    var $ret = document.getElementById('ret');

    var pop = keyframes({
        0: {
            scale: 0.8,
            rotate: '30deg'
        },
        0.5: {
            scale: 1.2,
            rotate: '-15deg'
        },
        1: {
            scale: 1,
            rotate: '0deg'
        }
    });

    var an = new Animation();

    an.push('#demo1', {opacity: 1}, {duration: 300});
    an.push('#demo2', {opacity: 1}, {duration: 300, delay: 400});
    an.push('#demo3', {opacity: 1}, {duration: 300, delay: 400});
    an.push('#demo4', {opacity: 1}, {duration: 300, delay: 400});
    an.push('#demo5', {opacity: 1}, {duration: 300, delay: 400});
    an.push('#demo5', pop, {duration: 600});
    an.push('#demo4,#demo3,#demo2,#demo1', pop, {duration: 600});

    $start.onclick = function () {
        an.start();
    };

    an.on('change', function (index, times) {
        $ret.innerHTML = '第' + times + '次第' + (index + 1) + '帧动画';
    });
});