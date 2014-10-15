/*!
 * Drag.js
 * @author ydr.me
 * @create 2014-10-10 22:09
 */


define(function (require, exports, module) {
    /**
     * @author ydr.me
     * @create 2014-09-27 15:51
     *
     * @module ui/Drag
     * @requires util/class
     * @requires util/data
     * @requires libs/Emitter
     * @requires core/event/touch
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     */

    'use strict';

    var udf;
    var klass = require('../util/class.js');
    var data = require('../util/data.js');
    var Emitter = require('../libs/Emitter.js');
    var event = require('../core/event/touch.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var animation = require('../core/dom/animation.js');
    var start = 'mousedown taphold';
    var move = 'mousemove touchmove';
    var end = 'mouseup touchend touchcancel';
    var dragClass = 'alien-ui-drag';
    var body = document.body;
    var defaults = {
        // 鼠标操作区域选择器，默认为 null，即整个元素
        // 参数为选择器字符串
        handle: null,

        // 拖拽轴向，x：水平，y：垂直，xy：所有
        axis: 'xy',

        // 拖拽对象的最小位置，格式为{left: 10, top: 10}
        // 参考于 document
        min: null,

        // 拖拽对象的最大位置，格式为{left: 1000, top: 1000}
        // 参考于 document
        max: null,

        // 是否阻止默认拖拽效果
        preventDefault: !1,

        duration: 300,

        easing: 'in-out'
    };
    var Drag = klass.create({
        STATIC: {
            /**
             * 默认配置
             * @name defaults
             * @property {null|Object|String} [handle] 鼠标操作区域选择器，默认为 null，即整个元素
             * @property {String} [axis] 拖拽轴向，x：水平，y：垂直，xy：所有，默认为"xy"
             * @property {null|Object} [min] 拖拽对象的最小位置，格式为{left: 10, top: 10}，参考于 document
             * @property {null|Object} [max] 拖拽对象的最大位置，格式为{left: 1000, top: 1000}，参考于 document
             * @property {Number} [zIndex] 拖拽时的层级值，默认为99999
             * @property {Boolean} [preventDefault] 是否阻止默认拖拽行为，默认 false
             * @property {Number} [duration=300] 运动到拖拽位置时间，默认为300ms
             * @property {String} [easing="in-out"] 运动到拖拽位置缓冲效果
             */
            defaults: defaults
        },


        constructor: function (ele, options) {
            var the = this;


            the._ele = selector.query(ele);

            if(!the.ele){
                throw new Error('instance element is empty');
            }

            the.ele = the.ele[0];
            Emitter.apply(the, arguments);
            the._options = data.extend(!0, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var ele = the._ele;
            var options = the._options;
            var handle = options.handle ? selector.query(options.handle, ele) : ele;

            the._handle = handle.length ? handle[0] : ele;
            event.on(the._handle, start, the._start.bind(the));
            event.on(document, move, the._move.bind(the));
            event.on(document, end, the._end.bind(the));

            return the;
        },

        /**
         * 销毁拖拽
         */
        destroy: function () {
            var the = this;

            event.un(the._handle, start, the._start);
            event.un(document, move, the._move);
            event.un(document, end, the._end);
        },





        /**
         * 克隆一个可视副本
         * @private
         */
        _copy: function () {
            var the = this;
            var clone = modification.create('div', {
                'class': 'alien-ui-drag-clone',
                style: {
                    top: attribute.top(the._ele),
                    width: attribute.width(the._ele) - 2,
                    height: attribute.height(the._ele) - 2,
                    left: attribute.left(the._ele),
                    zIndex: 999999999999
                }
            });
            the._clone = modification.insert(clone, body, 'beforeend', !0);
        },


        /**
         * 开始拖拽
         * @param eve
         * @private
         */
        _start: function (eve) {
            var the = this;
            var type = eve.type;
            var options = the._options;

            if (!the._is && (type === 'mousedown' && eve.which === 1 || type === 'taphold')) {



                the._is = !0;
                the._pageX = eve.pageX;
                the._pageY = eve.pageY;
                the._left = attribute.left(the._ele);
                the._top = attribute.top(the._ele);

                if(attribute.css(the._ele, 'position') === 'static'){
                    attribute.css(the._ele, 'position', 'absolute');
                }

                attribute.left(the._ele, the._left);
                attribute.top(the._ele, the._top);

                attribute.addClass(the._ele, dragClass);
                eve.preventDefault();
                attribute.css(the._ele, 'z-index', options.zIndex);
                    the._copy();

                the.emit('dragstart', eve);
            }
        },


        /**
         * 拖拽中
         * @param eve
         * @private
         */
        _move: function (eve) {
            var the = this;
            var options = the._options;
            var x;
            var y;

            if (the._is) {
                if (eve.type === 'mousemove' && eve.which !== 1) {
                    event.dispatch(the._ele, 'mouseup');
                } else {
                    if (!options.preventDefault) {
                        if (options.axis.indexOf('x') > -1) {
                            x = the._left + eve.pageX - the._pageX;

                            if (options.min && options.min.x !== udf && x < options.min.x) {
                                x = options.min.x;
                            }

                            if (options.max && options.max.x !== udf && x > options.max.x) {
                                x = options.max.x;
                            }

                            attribute.left(the._clone, x);
                        }

                        if (options.axis.indexOf('y') > -1) {
                            y = the._top + eve.pageY - the._pageY;

                            if (options.min && options.min.y !== udf && y < options.min.y) {
                                y = options.min.y;
                            }

                            if (options.max && options.max.y !== udf && y > options.max.y) {
                                y = options.max.y;
                            }

                            attribute.top(the._clone, y);
                        }
                    }

                    the.emit('drag', eve);

                    eve.preventDefault();
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
            var options = the._options;
            var from;
            var to;

            if (the._is) {
                the._is = !1;
                from = {
                    left: data.parseFloat(attribute.css(the._ele, 'left')),
                    top: data.parseFloat(attribute.css(the._ele, 'top'))
                };
                attribute.left(the._ele, attribute.left(the._clone));
                attribute.top(the._ele, attribute.top(the._clone));
                to = {
                    left: data.parseFloat(attribute.css(the._ele, 'left')),
                    top: data.parseFloat(attribute.css(the._ele, 'top'))
                };
                attribute.css(the._ele, from);
                animation.stop(the._ele);
                animation.animate(the._ele, to, {
                    duration: options.duration,
                    easing: options.easing
                });
                attribute.removeClass(the._ele, dragClass);
                eve.preventDefault();

                modification.remove(the._clone);

                the.emit('dragend', eve);
            }
        }
    }, Emitter);
    var style =
        '.alien-ui-drag-clone{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;opacity:.5;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;position:absolute;z-index:999;background:#eee;border:1px dotted #000}';

    modification.importStyle(style);

    /**
     * 实例化一个拖拽对象
     *
     * @param {HTMLElement} ele 元素
     * @param {Object} [options] 参数配置
     * @param {null|Object|String} [options.handle] 鼠标操作区域选择器，默认为 null，即整个元素
     * @param {String} [options.axis] 拖拽轴向，x：水平，y：垂直，xy：所有，默认为"xy"
     * @param {null|Object} [options.min] 拖拽对象的最小位置，格式为{left: 10, top: 10}，参考于 document
     * @param {null|Object} [options.max] 拖拽对象的最大位置，格式为{left: 1000, top: 1000}，参考于 document
     * @param {Number} [options.zIndex] 拖拽时的层级值，默认为99999
     * @param {Boolean} [options.preventDefault] 是否阻止默认拖拽行为，默认 false
     * @param {Number} [options.duration=300] 运动到拖拽位置时间，默认为300ms
     * @param {String} [options.easing="in-out"] 运动到拖拽位置缓冲效果
     * @constructor
     */
    module.exports = Drag;
});