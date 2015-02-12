define(function (require) {
    'use strict';

    var keyframes = require('../../src/util/keyframes.js');
    var animation = require('../../src/core/dom/animation.js');
    var $demo = document.getElementById('demo');
    var $ret = document.getElementById('ret');
    var yaobai = keyframes({
        0: {
            translateX: '-10px'
        },
        0.3: {
            translateX: '6px'
        },
        0.6: {
            translateX: '-3px'
        },
        1: {
            translateX: '0px'
        }
    });
    
    document.getElementById('btn').onclick = function () {
        animation.keyframes($demo, {
            name: yaobai,
            duration: 2000,
            count: 3
        }, function () {
            $ret.insertAdjacentHTML('beforeend', '动画完成<br>');
        }, function (eve) {
            console.log(eve);
            $ret.insertAdjacentHTML('beforeend', '动画迭代<br>');
        });
    };


});