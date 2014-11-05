/*!
 * Banner.js
 * @author ydr.me
 * @create 2014-10-22 01:10
 */

define(function (require) {
    'use strict';

    var Banner = require('/src/ui/Banner/index.js');
    var $index = document.getElementById('index');
    var bn = new Banner('#slider1', {
        width: 700,
        height: 300
    });

    bn.on('change', function (index) {
        $index.innerHTML = index + 1;
    });

    document.getElementById('prev').onclick = function () {
        bn.prev();
    };

    document.getElementById('next').onclick = function () {
        bn.next();
    };

    document.getElementById('play1').onclick = function () {
        bn.play(1);
    };

    document.getElementById('play2').onclick = function () {
        bn.play(-1);
    };

    document.getElementById('pause').onclick = function () {
        bn.pause();
    };

    document.getElementById('destroy').onclick = function () {
        bn.destroy();
        bn = null;
    };
});