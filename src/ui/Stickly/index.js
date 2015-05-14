/*!
 * 滚动固定
 * @author ydr.me
 * @create 2015-03-19 10:43
 */


define(function (require, exports, module) {
    /**
     * @module ui/Stickly/
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/event/touch
     * @requires utils/dato
     * @requires utils/controller
     */
    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');
    var defaults = {
        containerSelector: window,
        className: 'stickly',
        wait: 30,
        offset: 10
    };
    var Stickly = ui.create({
        constructor: function ($ele, options) {
            var the = this;

            the._$ele = selector.query($ele)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._$container = selector.query(the._options.containerSelector)[0];

            return the._init();
        },
        _init: function () {
            var the = this;

            the._initEvent();
            the._stickly();

            return the;
        },


        _initEvent: function () {
            var the = this;
            var options = the._options;

            the._onscroll = controller.throttle(the._stickly.bind(the), options.wait);
            event.on(the._$container, 'scroll touch1move', the._onscroll.bind(the));
        },


        _stickly: function () {
            var the = this;
            var options = the._options;

            attribute.removeClass(the._$ele, options.className);

            var top = attribute.top(the._$ele) + options.offset;
            var scrollTop = attribute.scrollTop(the._$container);

            if (scrollTop >= top) {
                attribute.addClass(the._$ele, options.className);
                /**
                 * 固定住了
                 * @param isStick {Boolean} 是否固定住了
                 */
                the.emit('stick', true);
            } else {
                attribute.removeClass(the._$ele, options.className);
                /**
                 * 取消固定住了
                 * @param isStick {Boolean} 是否固定住了
                 */
                the.emit('stick', false);
            }
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            event.un(the._$container, 'scroll touch1move', the._onscroll);
        }
    });


    Stickly.defaults = defaults;
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