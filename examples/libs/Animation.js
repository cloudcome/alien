define(function (require) {
    'use strict';

    var Animation = require('../../src/libs/Animation.js');
    var an = new Animation();
    var $start = document.getElementById('start');
    //var $pause = document.getElementById('pause');
    //var $stop = document.getElementById('stop');
    var $ret = document.getElementById('ret');

    an.on('change', function (index, times) {
        $ret.innerHTML = '第' + times + '次第' + (index + 1) + '帧动画';
    });

    an.push('#demo1', {opacity: 1}, {duration: 300});
    an.push('#demo2', {opacity: 1}, {duration: 300, delay: 400});
    an.push('#demo3', {opacity: 1}, {duration: 300, delay: 400});
    an.push('#demo4', {opacity: 1}, {duration: 300, delay: 400});
    an.push('#demo5', {opacity: 1}, {duration: 300, delay: 400});


    $start.onclick = function () {
        an.start();
    };
});