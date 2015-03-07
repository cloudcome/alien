/*!
 * 视口内滚动监听
 * @author ydr.me
 * @create 2015-03-05 10:27
 */


define(function (require, exports, module) {
    /**
     * @module ui/Scrollspy/
     * @requires core/dom/see
     * @requires core/dom/selector
     * @requires core/event/base
     * @requires utils/controller
     * @requires utils/dato
     * @requires utils/class
     * @requires libs/Emitter
     * @requires ui/base.js
     */
    'use strict';

    var see = require('../../core/dom/see.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var controller = require('../../utils/controller.js');
    var dato = require('../../utils/dato.js');
    var klass = require('../../utils/class.js');
    var Emitter = require('../../libs/Emitter.js');
    var ui = require('../base.js');
    var alienKey = '-alien-ui-Scrollspy-in-viewport-';
    var defaults = {
        selector: 'img',
        wait: 123
    };
    var Scrollspy = ui.create(function ($parent, options) {
        var the = this;

        the._$parent = selector.query($parent)[0];
        the._options = dato.extend({}, defaults, options);
        the._init();
    });

    Scrollspy.fn._init = function () {
        var the = this;

        the._initEvent();
        controller.nextTick(the._onscroll.bind(the));
    };

    Scrollspy.fn._initEvent = function () {
        var the = this;

        event.on(the._$parent, 'scroll', controller.debounce(the._onscroll.bind(the), the._options.wait));
    };

    Scrollspy.fn._onscroll = function () {
        var the = this;
        var options = the._options;
        var $res = selector.query(options.selector);

        dato.each($res, function (index, $re) {
            var isInViewport = see.isInViewport($re);
            var udf;

            if (($re[alienKey] === true || $re[alienKey] === udf) && !isInViewport) {
                /**
                 * 离开视口后触发
                 * @event leaveviewport
                 * @param node {HTMLElement} 元素
                 */
                the.emit('leaveviewport', $re);
            } else if (($re[alienKey] === false || $re[alienKey] === udf) && isInViewport) {
                /**
                 * 进入视口后触发
                 * @event enterviewport
                 * @param node {HTMLElement} 元素
                 */
                the.emit('enterviewport', $re);
            }

            $re[alienKey] = isInViewport;
        });
    };


    /**
     * 实例化一个滚动监听，已加入性能优化
     * @param $parent {Object} 监听的父级元素
     * @param [options] {Object} 配置
     * @param [options.selector="img"] {String|HTMLElement|HTMLCollection} 被计算的元素选择器
     * @param [options.wait=123] {Number} 计算等待时间
     */
    module.exports = Scrollspy;
});