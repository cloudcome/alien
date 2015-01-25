/*!
 * Banner.js
 * @author ydr.me
 * @create 2014-10-22 01:10
 */

define(function (require) {
    'use strict';

    var Banner = require('/src/ui/Banner/index.js');
    var control = require('/src/util/control.js');
    var event = require('/src/core/event/base.js');
    var $index = document.getElementById('index');
    var $banner = document.getElementById('banner');
    var banner = new Banner('#banner', {
        width: Math.min(window.innerWidth, 300),
        height: 200,
        duration: 1000,
        axis: '+x',
        isAutoPlay: false,
        navGenerator: function (index, length) {
            return '<li>' + (index + 1) + '</li>';
        },
        navSelector: 'li',
        $navParent: document.getElementById('nav')
    });

    event.on($banner, 'click', '.prev', function () {
        banner.prev();
    });

    event.on($banner, 'click', '.next', function () {
        banner.next();
    });

    window.onresize = control.debounce(function () {
        banner.resize({
            width: Math.min(window.innerWidth, 460)
        });
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