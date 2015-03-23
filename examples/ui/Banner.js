/*!
 * Banner.js
 * @author ydr.me
 * @create 2014-10-22 01:10
 */

define(function (require) {
    'use strict';

    var Banner = require('../../src/ui/Banner/index.js');
    var control = require('../../src/utils/controller.js');
    var event = require('../../src/core/event/base.js');
    var selector = require('../../src/core/dom/selector.js');
    var attribute = require('../../src/core/dom/attribute.js');
    var $index = document.getElementById('index');
    var $banner = document.getElementById('banner');
    var $nav = document.getElementById('nav');
    var banner = new Banner('#banner', {
        width: window.innerWidth,
        height: 200,
        axis: '+x',
        interval: 1000,
        isAutoPlay: false,
        navGenerator: function (index, length) {
            return '<li data-index="' + index + '">' + (index + 1) + '/' + length + '</li>';
        },
        $navParent: $nav,
        index: 2
    });

    event.on($banner, 'click', '.prev', function () {
        banner.prev();
    });

    event.on($banner, 'click', '.next', function () {
        banner.next();
    });

    event.on($nav, 'click', 'li', function () {
        var index = this.dataset.index;

        banner.pause();
        banner.index(index);
        banner.play();
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