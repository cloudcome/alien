/*!
 * ui/Range
 * @author ydr.me
 * @create 2015-05-15 15:01
 */


define(function (require, exports, module) {
    /**
     * @module ui/Range/
     */

    'use strict';

    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var modification = require('../../core/dom/modification.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/drag.js');
    var dato = require('../../utils/dato.js');
    var number = require('../../utils/number.js');
    var typeis = require('../../utils/typeis.js');
    var ui = require('../');
    var alienClass = 'alien-ui-slidebar';
    var defaults = {
        // 方向，horizontal OR vertical
        orientation: 'horizontal',
        step: 10,
        min: 0,
        max: 100,
        // 数组：---o--------o----
        // 单值：------------o----
        value: 0
    };
    var Range = ui.create({
        constructor: function ($parent, options) {
            var the = this;

            the._$parent = selector.query($parent)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;


            the._initData();
            the._initNode();
            the._initEvent();
        },


        /**
         * 初始化数据
         * @private
         */
        _initData: function () {
            var the = this;
            var options = the._options;

            // 滑块的尺寸
            the._size = 16;
            options.value = typeis.number(options.value) ? [options.value] : options.value;
            the._isDouble = options.value.length > 1;
            //the._value0 = options.value[0];
            //the._value1 = options.value[the._isDouble ? 1 : 0];
        },


        /**
         * 更新内容，尺寸等
         */
        update: function () {
            var the = this;

            the._maxInner = attribute.innerWidth(the._$inner);
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;

            the._$parent.innerHTML = tpl.render({
                isDouble: the._isDouble
            });

            var nodes = selector.query('.j-flag', the._$parent);

            the._$inner = nodes[0];
            the._$fg = nodes[1];
            the._$control0 = nodes[2];
            the._$control1 = nodes[3];
            the.update();
            the._update(0, options.value[0]);
            the._update(1, options.value[the._isDouble ? 1 : 0]);
            the._pos0 = the._calPos(the._value0);
            the._pos1 = the._calPos(the._value1);
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;

            event.on(the._$control0, 'dragstart', function () {
                the._toggleActive(this, true);
                return false;
            });

            event.on(the._$control0, 'drag', function (eve) {
                var now = the._pos0 + eve.alienDetail.deltaX;

                if (now >= 0 && now <= the._maxInner - the._size) {
                    the._update(0, the._calVal(now));
                }

                return false;
            });

            event.on(the._$control0, 'dragend', function () {
                the._pos0 = the._calPos(the._value0);
                the._toggleActive(this, false);
                return false;
            });

            if (the._$control1) {
                event.on(the._$control1, 'dragstart', function () {
                    the._toggleActive(this, true);
                    return false;
                });

                event.on(the._$control1, 'drag', function (eve) {
                    var now = the._pos1 + eve.alienDetail.deltaX;

                    if (now >= 0 && now <= the._maxInner - the._size) {
                        the._update(1, the._calVal(now));
                    }

                    return false;
                });

                event.on(the._$control1, 'dragend', function () {
                    the._pos1 = the._calPos(the._value1);
                    the._toggleActive(this, false);
                    return false;
                });
            }
        },


        /**
         * 数据 change
         * @private
         */
        _onchange: function () {
            var the = this;

            the.emit('change', the._isDouble ? {
                min: the._value0,
                max: the._value1
            } : {
                min: the._options.min,
                max: the._value0
            });
        },


        /**
         * 改变数据
         */
        change: function (value) {
            var the = this;

            value = typeis.number(value) ? [value] : value;
            the._update(0, value[0], true);
            the._update(1, value[the._isDouble ? 1 : 0], true);
        },


        /**
         * 更新滑块 + 轨道
         * @param index
         * @param val
         * @param [isUpdatePos]
         * @private
         */
        _update: function (index, val, isUpdatePos) {
            var the = this;

            val = the._adjustVal(val);

            if (index === 0 && val !== the._value0 && (!the._isDouble || !the._value1 || val < the._value1)) {
                attribute.css(the._$control0, 'left', the._calPos(val));
                the._value0 = val;
                the._upBar(isUpdatePos);
                the._onchange();
            } else if (index === 1 && val !== the._value1 && val > the._value0) {
                attribute.css(the._$control1, 'left', the._calPos(val));
                the._value1 = val;
                the._upBar(isUpdatePos);
                the._onchange();
            }
        },


        /**
         * 更新 bar 的长度和边距
         * @param [isUpdatePos]
         * @private
         */
        _upBar: function (isUpdatePos) {
            var the = this;

            var pos0 = the._calPos(the._value0);
            var pos1 = the._calPos(the._value1);

            if (isUpdatePos) {
                the._pos0 = pos0;
                the._pos1 = pos1;
            }

            attribute.css(the._$fg, {
                left: the._isDouble ? pos0 : 0,
                width: the._isDouble ? pos1 - pos0 : pos0
            });
        },


        /**
         * 切换是否 active
         * @param $ele
         * @param boolean
         * @private
         */
        _toggleActive: function ($ele, boolean) {
            var className = alienClass + '-control-active';

            attribute[(boolean ? 'add' : 'remove') + 'Class']($ele, className);
        },


        /**
         * 计算位置
         * @param val
         * @param [isBar]
         * @returns {number}
         * @private
         */
        _calPos: function (val, isBar) {
            var the = this;
            var options = the._options;

            return val / (options.max - options.min) * (the._maxInner - (isBar ? 0 : the._size));
        },


        /**
         * 根据步长调整值
         * @param val
         * @returns {Number}
         * @private
         */
        _adjustVal: function (val) {
            var the = this;
            var options = the._options;
            var step = options.step > 0 ? options.step : 1;
            var sf = val % step;
            var num = val / step;

            // 如果2倍余数大于步长，则向上取整，否则向下
            return step * (sf * 2 >= step ? Math.ceil(num) : Math.floor(num));
        },


        /**
         * 计算数值
         * @param pos
         * @private
         */
        _calVal: function (pos) {
            var the = this;
            var options = the._options;
            var val = (options.max - options.min) * pos / (the._maxInner - the._size);

            return options.min + the._adjustVal(val);
        }
    });

    Range.defaults = defaults;
    modification.importStyle(style);
    module.exports = Range;
});