define(function (require) {
    'use strict';

    var keyframes = require('../../src/utils/keyframes.js');
    var animation = require('../../src/core/dom/animation.js');
    var modification = require('../../src/core/dom/modification.js');
    var $demo = document.getElementById('demo');
    
    var pengzhuang = keyframes({
        0: {
            scale: 0.8,
            translateX: -10
        },
        0.3: {
            scale: 1.2,
            translateX: 60
        },
        0.6: {
            scale: 0.9,
            translateX: -30
        },
        1: {
            scale: 1,
            translateX: 20
        }
    });
    
    document.getElementById('btn').onclick = function () {
        animation.keyframes($demo, {
            name: pengzhuang,
            duration: 1000,
            count: 3
        }, function () {
            modification.insert('动画完成<br>', document.body);
        }, function (eve) {
            modification.insert('动画迭代' + eve.elapsedTime + '<br>', document.body);
        });
    };


});