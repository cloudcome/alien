define(function (require) {
    'use strict';

    var animation = require('/src/core/dom/animation.js');
    var ret = document.getElementById('ret');
    var keyframes = require('/src/core/dom/keyframes.js');
    var test = keyframes.create({
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

    window.animation = animation;

    document.getElementById('transition').onclick = function () {
        animation.transition('#demo', {
            width: 500,
            height: 500,
            transform: 'scale(1)'
        }, {
            duration: 3000,
            delay: 0
        }, function () {
            ret.innerHTML = '运行结束' + Date.now();
        });
    };

    document.getElementById('keyframes').onclick = function () {
        animation.keyframes('#demo', test, {
            duration: 3000,
            delay: 0
        }, function () {
            ret.innerHTML = '运行结束' + Date.now();
        });
    };

    document.getElementById('scrollTo').onclick = function () {
        animation.scrollTo(window, {
            x: 200,
            y: 2000
        });
    };
});