/*!
 * Banner.js
 * @author ydr.me
 * @create 2014-10-22 01:10
 */

define(function (require) {
    'use strict';

    var Banner = require('/src/ui/Banner/index.js');
    var $index = document.getElementById('index');
    var banner = new Banner('#banner', {
        width: 460,
        height: 200,
        axis: '+y',
        navGenerator: function (index, length) {
            return '<li>'+(index+1)+'</li>';
        },
        navSelector: 'li',
        $navParent: document.getElementById('nav')
    });

    banner.on('change', function (index) {
        $index.innerHTML = index + 1;
    });

    document.getElementById('prev').onclick = function () {
        banner.prev();
    };

    document.getElementById('next').onclick = function () {
        banner.next();
    };

    document.getElementById('play').onclick = function () {
        banner.play();
    };

    document.getElementById('pause').onclick = function () {
        banner.pause();
    };

    document.getElementById('destroy').onclick = function () {
        banner.destroy();
        banner = null;
    };

    window.banner = banner;
});