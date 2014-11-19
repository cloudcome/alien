/*!
 * Banner.js
 * @author ydr.me
 * @create 2014-10-22 01:10
 */

define(function (require) {
    'use strict';

//var generator = require('/src/ui/generator.js');
//var MyUI = generator({
//    /**
//     * 构造函数
//     */
//    constructor: function () {
//        var the = this;
//
//        // 自动初始化
//        the._init();
//    },
//
//
//    /**
//     * 初始化
//     * @private
//     */
//    _init: function () {
//        var the = this;
//
//        the._initData();
//        the._initNode();
//        the._initEvent();
//    },
//
//
//    /**
//     * 初始化数据
//     * @private
//     */
//    _initData: function () {
//        // code
//    },
//
//
//    /**
//     * 初始化节点
//     * @private
//     */
//    _initNode: function () {
//        // code
//    },
//
//
//    /**
//     * 初始化事件
//     * @private
//     */
//    _initEvent: function () {
//        // code
//    },
//
//
//    /**
//     * 销毁实例
//     */
//    destroy: function () {
//        // 1、节点的还原归位
//        // 2、事件的解除绑定
//    }
//});

    var Banner = require('/src/ui/Banner/index.js');
    var $index = document.getElementById('index');
    var banner = new Banner('#slider1', {
        width: 460,
        height: 200,
        axis: '+y'
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