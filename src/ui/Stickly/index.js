/*!
 * 滚动固定
 * @author ydr.me
 * @create 2015-03-19 10:43
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */
    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');
    var defaults = {
        containerSelector: window,
        className: 'stickly',
        wait: 123
    };
    var Stickly = ui.create(function ($ele, options) {
        var the = this;

        the._$ele = selector.query($ele)[0];
        the._options = dato.extend(true, {}, defaults, options);
        the._$container = selector.query(the._options.containerSelector)[0];

        return the._init();
    });

    Stickly.fn._init = function () {
        var the = this;

        the._initEvent();
        the._stickly();

        return the;
    };


    Stickly.fn._initEvent = function () {
        var the = this;
        var options = the._options;

        the._onscroll = controller.throttle(the._stickly.bind(the), options.wait);
        event.on(the._$container, 'scroll', the._onscroll.bind(the));
    };


    Stickly.fn._stickly = function () {
        var the = this;
        var options = the._options;

        attribute.removeClass(the._$ele, options.className)

        var top = attribute.top(the._$ele);
        var scrollTop = attribute.scrollTop(the._$container);

        if (scrollTop >= top) {
            attribute.addClass(the._$ele, options.className)
        } else {
            attribute.removeClass(the._$ele, options.className)
        }
    };


    /**
     * 滚动固定
     * @param $ele {Object} 监听的元素
     * @param [options] {Object} 配置
     * @param [options.containerSelector=window] {*} 容器选择器
     * @param [options.className="stickly"] {String} 固定时增加的 className
     * @param [options.wait=123] {Number} 监听时间间隔
     */
    module.exports = Stickly;
});