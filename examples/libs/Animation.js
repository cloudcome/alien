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

    an.push('#demo1', {width: 200}, {duration: 300});
    an.push('#demo1', {marginLeft: 200}, {duration: 300});
    an.push('#demo2', {width: 200}, {duration: 300});
    an.push('#demo2', {marginLeft: 200}, {duration: 300});
    an.push('#demo3', {width: 200}, {duration: 300});
    an.push('#demo3', {marginLeft: 200}, {duration: 300});
    an.push('#demo1', {width: 100}, {duration: 300});
    an.push('#demo1', {marginLeft: 0}, {duration: 300});
    an.push('#demo2', {width: 100}, {duration: 300});
    an.push('#demo2', {marginLeft: 0}, {duration: 300});
    an.push('#demo3', {width: 100}, {duration: 300});
    an.push('#demo3', {marginLeft: 0}, {duration: 300});

    $start.onclick = function () {
        an.start(3);
    };
});