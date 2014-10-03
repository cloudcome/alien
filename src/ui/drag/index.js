/*!
 * index.js
 * @author ydr.me
 * @create 2014-09-27 15:51
 */


define(function (require, exports, module) {
    'use strict';


    var udf;
    var data = require('../../util/data.js');
    var event = require('../../core/event/touch.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var position = require('../../core/dom/position.js');
    var modification = require('../../core/dom/modification.js');
    var start = 'mousedown taphold';
    var move = 'mousemove touchmove';
    var end = 'mouseup touchend touchcancel';
    var klass = 'alien-drag';
    var body = document.body;
    var noop = function () {
        // ignore
    };
    var defaults = {
        // 鼠标操作区域选择器，默认为 null，即整个元素
        // 参数为选择器字符串
        handle: null,

        // 是否克隆一个副本作为参考对象，默认 true
        isClone: !0,

        // 拖拽轴向，x：水平，y：垂直，xy：所有
        axis: 'xy',

        // 拖拽对象的最小位置，格式为{left: 10, top: 10}
        // 参考于 document
        min: null,

        // 拖拽对象的最大位置，格式为{left: 1000, top: 1000}
        // 参考于 document
        max: null,

        // 拖拽时的层级值
        zIndex: 99999,

        // 拖拽开始后回调
        // this: drag element
        // arg0: event
        ondragstart: noop,

        // 拖拽中回调
        // this: drag element
        // arg0: event
        ondrag: noop,

        // 拖拽结束后回调
        // this: drag element
        // arg0: event
        ondragend: noop
    };
    /**
     * 构造一个拖拽
     * @param {HTMLElement} ele 元素
     * @param {Object} [options] 配置
     * @constructor
     */
    var Drag = function (ele, options) {
        this.ele = ele;
        this.options = options;
    };

    require('./style.js');

    Drag.prototype = {
        constructor: Drag,
        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var ele = the.ele;
            var options = the.options;
            var handle = options.handle ? selector.query(options.handle, ele) : ele;

            handle = handle.length ? handle[0] : ele;
            event.on(handle, start, the._start.bind(the));
            event.on(document, move, the._move.bind(the));
            event.on(document, end, the._end.bind(the));
        },
        /**
         * 克隆一个可视副本
         * @private
         */
        _clone: function () {
            var the = this;
            var clone = modification.create('div', {
                'class': 'alien-clone',
                style: {
                    top: position.top(the.ele),
                    width: position.width(the.ele),
                    height: position.height(the.ele),
                    left: position.left(the.ele),
                    zIndex: the.options.zIndex - 1
                }
            });
            the.clone = modification.insert(clone, body, 'beforeend', !0);
        },
        /**
         * 开始拖拽
         * @param eve
         * @private
         */
        _start: function (eve) {
            var the = this;
            var type = eve.type;
            var options = the.options;

            if (!the.is && (type === 'mousedown' && eve.which === 1 || type === 'taphold')) {
                the.is = !0;
                the.pageX = eve.pageX;
                the.pageY = eve.pageY;
                the.top = position.top(the.ele);
                the.left = position.left(the.ele);
                the.zIndex = attribute.css(the.ele, 'z-index');
                attribute.addClass(the.ele, klass);
                eve.preventDefault();
                attribute.css(the.ele, 'z-index', options.zIndex);

                if (options.isClone) {
                    the._clone();
                }

                the.options.ondragstart.call(the.ele, eve);
            }
        },
        /**
         * 拖拽中
         * @param eve
         * @private
         */
        _move: function (eve) {
            var the = this;
            var options = the.options;
            var x;
            var y;

            if (the.is) {
                if (eve.type === 'mousemove' && eve.which !== 1) {
                    event.dispatch(the.ele, 'mouseup');
                } else {
                    if (options.axis.indexOf('x') > -1) {
                        x = the.left + eve.pageX - the.pageX;

                        if (options.min && options.min.x !== udf && x < options.min.x) {
                            x = options.min.x;
                        }

                        if (options.max && options.max.x !== udf && x > options.max.x) {
                            x = options.max.x;
                        }

                        position.left(the.ele, x);
                    }

                    if (options.axis.indexOf('y') > -1) {
                        y = the.top + eve.pageY - the.pageY;

                        if (options.min && options.min.y !== udf && y < options.min.y) {
                            y = options.min.y;
                        }

                        if (options.max && options.max.y !== udf && y > options.max.y) {
                            y = options.max.y;
                        }

                        position.top(the.ele, y);
                    }

                    eve.preventDefault();
                    the.options.ondrag.call(the.ele, eve);
                }
            }
        },
        /**
         * 拖拽结束
         * @param eve
         * @private
         */
        _end: function (eve) {
            var the = this;

            if (the.is) {
                the.is = !1;
                attribute.removeClass(the.ele, klass);
                eve.preventDefault();
                attribute.css(the.ele, 'z-index', the.zIndex);

                if (the.clone) {
                    modification.remove(the.clone);
                }

                the.options.ondragend.call(the.ele, eve);
            }
        }
    };



    /**
     * 实例化一个拖拽对象
     * @module ui/drag/index
     * @requires util/data
     * @requires core/event/touch
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/position
     * @requires core/dom/modification
     * @requires core/dom/modification
     *
     * @param {HTMLElement} ele 元素
     * @param {Object} [options] 参数配置
     * @param {null|Object|String} [options.handle] 鼠标操作区域选择器，默认为 null，即整个元素
     * @param {Boolean} [options.isClone] 是否克隆一个副本作为参考对象，默认 true
     * @param {String} [options.axis] 拖拽轴向，x：水平，y：垂直，xy：所有，默认为"xy"
     * @param {null|Object} [options.min] 拖拽对象的最小位置，格式为{left: 10, top: 10}，参考于 document
     * @param {null|Object} [options.max] 拖拽对象的最大位置，格式为{left: 1000, top: 1000}，参考于 document
     * @param {Number} [options.zIndex] 拖拽时的层级值，默认为99999
     * @param {Function} [options.ondragstart] 拖拽开始后回调
     * @param {Function} [options.ondrag] 拖拽中回调
     * @param {Function} [options.ondragend] 拖拽结束后回调
     * @returns {*}
     *
     * @example
     * var drag = drag(ele);
     */
    module.exports = function (ele, options) {
        options = data.extend(!0, {}, defaults, options);

        return (new Drag(ele, options))._init();
    };
});