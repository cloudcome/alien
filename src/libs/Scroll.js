/*!
 * 滚动元素的 scroll 监听
 * @author ydr.me
 * @create 2015-04-22 18:08
 */


define(function (require, exports, module) {
    /**
     * @module ui/Scroll/
     * @requires utils/class
     * @requires utils/dato
     * @requires utils/controller
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/event/touch
     * @requires core/navigator/compatible
     * @requires libs/Emitter
     */
    'use strict';

    var klass = require('../utils/class.js');
    var dato = require('../utils/dato.js');
    var controller = require('../utils/controller.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var event = require('../core/event/touch.js');
    var compatible = require('../core/navigator/compatible.js');
    var Emitter = require('./Emitter.js');
    var alienKey = 'alien-libs-scroll';
    var win = window;
    var doc = win.document;
    var $html = doc.documentElement;
    var $body = doc.body;
    var requestAnimationFrame = compatible.html5('requestAnimationFrame', win);
    // 存储被监听滚动的元素
    var listenMap = null;
    var defaults = {};
    var Scroll = klass.extends(Emitter).create({
        constructor: function ($container, options) {
            var the = this;

            // 容器
            the._$container = selector.query($container)[0];
            // 父级
            the._$parent = the._$container;
            // 相对
            the._$offset = the._$container;

            if (the._$container === win || the._$container === doc || the._$container === $html || the._$container === $body) {
                the._$container = doc;
                the._$parent = win;
                the._$offset = $body;
            }

            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },
        _init: function () {
            var the = this;
            var isListenDoc = the._$container === doc;

            event.on(the._$container, 'scroll touchstart touchmove', the._onscroll = function () {
                var scrollTop = attribute.scrollTop(the._$container);
                var scrollLeft = attribute.scrollLeft(the._$container);
                var top = isListenDoc ? 0 : attribute.top(the._$container);
                var left = isListenDoc ? 0 : attribute.left(the._$container);
                var innerHeight = attribute.innerHeight(the._$parent);
                var innerWidth = attribute.innerWidth(the._$parent);
                var scrollHeight = the._$offset.scrollHeight;
                var scrollWidth = the._$offset.scrollWidth;
                var ret = {
                    scrollTop: scrollTop,
                    scrollLeft: scrollLeft,
                    innerWidth: innerWidth,
                    innerHeight: innerHeight,
                    scrollWidth: scrollWidth,
                    scrollHeight: scrollHeight,
                    top: top,
                    left: left,
                    ratioX: scrollWidth <= innerWidth ? 1 : scrollLeft / (scrollWidth - innerWidth),
                    ratioY: scrollHeight <= innerHeight ? 1 : scrollTop / (scrollHeight - innerHeight)
                };
                var lastScroll = the._$container[alienKey];

                if (lastScroll) {
                    /**
                     * 滚动条向上滚动
                     * @event up
                     * @param ret {Object} 滚动条信息
                     * @param ret.scrollTop {Number} 滚动条上位移
                     * @param ret.scrollLeft {Number} 滚动条左位移
                     * @param ret.innerWidth {Number} 视窗宽度
                     * @param ret.innerHeight {Number} 视窗高度
                     * @param ret.scrollWidth {Number} 滚动宽度
                     * @param ret.scrollHeight {Number} 滚动高度
                     * @param ret.ratioX {Number} 水平滚动比例
                     * @param ret.ratioY {Number} 垂直滚动比例
                     */
                    /**
                     * 滚动条向下滚动
                     * @event down
                     * @param ret {Object} 滚动条信息
                     * @param ret.scrollTop {Number} 滚动条上位移
                     * @param ret.scrollLeft {Number} 滚动条左位移
                     * @param ret.innerWidth {Number} 视窗宽度
                     * @param ret.innerHeight {Number} 视窗高度
                     * @param ret.scrollWidth {Number} 滚动宽度
                     * @param ret.scrollHeight {Number} 滚动高度
                     * @param ret.ratioX {Number} 水平滚动比例
                     * @param ret.ratioY {Number} 垂直滚动比例
                     */
                    the.emit(lastScroll.t > scrollTop ? 'up' : 'down', ret);

                    /**
                     * 滚动条向左滚动
                     * @event pull
                     * @param ret {Object} 滚动条信息
                     * @param ret.scrollTop {Number} 滚动条上位移
                     * @param ret.scrollLeft {Number} 滚动条左位移
                     * @param ret.innerWidth {Number} 视窗宽度
                     * @param ret.innerHeight {Number} 视窗高度
                     * @param ret.scrollWidth {Number} 滚动宽度
                     * @param ret.scrollHeight {Number} 滚动高度
                     * @param ret.ratioX {Number} 水平滚动比例
                     * @param ret.ratioY {Number} 垂直滚动比例
                     */
                    /**
                     * 滚动条向右滚动
                     * @event push
                     * @param ret {Object} 滚动条信息
                     * @param ret.scrollTop {Number} 滚动条上位移
                     * @param ret.scrollLeft {Number} 滚动条左位移
                     * @param ret.innerWidth {Number} 视窗宽度
                     * @param ret.innerHeight {Number} 视窗高度
                     * @param ret.scrollWidth {Number} 滚动宽度
                     * @param ret.scrollHeight {Number} 滚动高度
                     * @param ret.ratioX {Number} 水平滚动比例
                     * @param ret.ratioY {Number} 垂直滚动比例
                     */
                    the.emit(lastScroll.l > scrollLeft ? 'pull' : 'push', ret);
                }

                if (scrollHeight > innerHeight) {
                    if (scrollTop + innerHeight >= scrollHeight) {
                        /**
                         * 滚动条滚动到底部
                         * @event bottom
                         * @param ret {Object} 滚动条信息
                         * @param ret.scrollTop {Number} 滚动条上位移
                         * @param ret.scrollLeft {Number} 滚动条左位移
                         * @param ret.innerWidth {Number} 视窗宽度
                         * @param ret.innerHeight {Number} 视窗高度
                         * @param ret.scrollWidth {Number} 滚动宽度
                         * @param ret.scrollHeight {Number} 滚动高度
                         * @param ret.ratioX {Number} 水平滚动比例
                         * @param ret.ratioY {Number} 垂直滚动比例
                         */
                        the.emit('bottom', ret);
                    } else if (!scrollTop) {
                        /**
                         * 滚动条滚动到顶部
                         * @event top
                         * @param ret {Object} 滚动条信息
                         * @param ret.scrollTop {Number} 滚动条上位移
                         * @param ret.scrollLeft {Number} 滚动条左位移
                         * @param ret.innerWidth {Number} 视窗宽度
                         * @param ret.innerHeight {Number} 视窗高度
                         * @param ret.scrollWidth {Number} 滚动宽度
                         * @param ret.scrollHeight {Number} 滚动高度
                         * @param ret.ratioX {Number} 水平滚动比例
                         * @param ret.ratioY {Number} 垂直滚动比例
                         */
                        the.emit('top', ret);
                    }

                    /**
                     * 滚动条垂直滚动
                     * @event y
                     * @param ret {Object} 滚动条信息
                     * @param ret.scrollTop {Number} 滚动条上位移
                     * @param ret.scrollLeft {Number} 滚动条左位移
                     * @param ret.innerWidth {Number} 视窗宽度
                     * @param ret.innerHeight {Number} 视窗高度
                     * @param ret.scrollWidth {Number} 滚动宽度
                     * @param ret.scrollHeight {Number} 滚动高度
                     * @param ret.ratioX {Number} 水平滚动比例
                     * @param ret.ratioY {Number} 垂直滚动比例
                     */

                    the.emit('y', ret);
                }

                if (scrollWidth > innerWidth) {
                    if (scrollLeft + innerWidth >= scrollWidth) {
                        /**
                         * 滚动条滚动到右边
                         * @event bottom
                         * @param ret {Object} 滚动条信息
                         * @param ret.scrollTop {Number} 滚动条上位移
                         * @param ret.scrollLeft {Number} 滚动条左位移
                         * @param ret.innerWidth {Number} 视窗宽度
                         * @param ret.innerHeight {Number} 视窗高度
                         * @param ret.scrollWidth {Number} 滚动宽度
                         * @param ret.scrollHeight {Number} 滚动高度
                         * @param ret.ratioX {Number} 水平滚动比例
                         * @param ret.ratioY {Number} 垂直滚动比例
                         */
                        the.emit('right', ret);
                    } else if (!scrollLeft) {
                        /**
                         * 滚动条滚动到左边
                         * @event bottom
                         * @param ret {Object} 滚动条信息
                         * @param ret.scrollTop {Number} 滚动条上位移
                         * @param ret.scrollLeft {Number} 滚动条左位移
                         * @param ret.innerWidth {Number} 视窗宽度
                         * @param ret.innerHeight {Number} 视窗高度
                         * @param ret.scrollWidth {Number} 滚动宽度
                         * @param ret.scrollHeight {Number} 滚动高度
                         * @param ret.ratioX {Number} 水平滚动比例
                         * @param ret.ratioY {Number} 垂直滚动比例
                         */
                        the.emit('left', ret);
                    }

                    /**
                     * 滚动条水平滚动
                     * @event x
                     * @param ret {Object} 滚动条信息
                     * @param ret.scrollTop {Number} 滚动条上位移
                     * @param ret.scrollLeft {Number} 滚动条左位移
                     * @param ret.innerWidth {Number} 视窗宽度
                     * @param ret.innerHeight {Number} 视窗高度
                     * @param ret.scrollWidth {Number} 滚动宽度
                     * @param ret.scrollHeight {Number} 滚动高度
                     * @param ret.ratioX {Number} 水平滚动比例
                     * @param ret.ratioY {Number} 垂直滚动比例
                     */

                    the.emit('x', ret);
                }

                the._$container[alienKey] = {t: scrollTop, l: scrollLeft};
            });

            win[requestAnimationFrame](the._onscroll, the);
        }
    });

    new Scroll(doc).on('x', function (ret) {
        console.log('....');

        //if(!listenMap && isListenDoc){
        //    listenMap = {};
        //    console.log('.....');
        //}

        //// 如果监听的是 document，那么永远触发 enter 事件
        //if (isListenDoc) {
        //    the.emit('enter');
        //} else {
        //    the.emit(top < scrollTop && left < scrollLeft ? 'leave' : 'enter');
        //}
    }).on('y', function (ret) {
        console.log('+++++');
    });

    Scroll.defaults = defaults;
    module.exports = Scroll;
});