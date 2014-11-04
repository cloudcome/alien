define(function (require) {
    'use strict';

    var animation = require('/src/core/dom/animation.js');
    var demo = document.getElementById('demo');
    var ret = document.getElementById('ret');

    window.animation = animation;

    demo.onclick = function () {
        animation.animate(demo, {
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

    document.getElementById('stop1').onclick = function () {
        animation.stop(demo, false);
    }

    document.getElementById('stop2').onclick = function () {
        animation.stop(demo, true);
    }

    document.getElementById('scrollTo').onclick = function () {
        animation.scrollTo(document, {
            x: 200,
            y: 200
        });
    }
});