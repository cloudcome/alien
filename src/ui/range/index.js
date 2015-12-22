/*!
 * ui/Range
 * @author ydr.me
 * @create 2015-05-15 15:01
 */


define(function (require, exports, module) {
    /**
     * @module ui/range/
     * @requires libs/template/
     * @requires core/dom/modification
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/animation
     * @requires core/event/drag
     * @requires utils/dato
     * @requires utils/number
     * @requires utils/typeis
     * @requires ui/
     */

    'use strict';

    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var Template = require('../../libs/template.js');
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
    var alienClass = 'alien-ui-range';
    var defaults = {
        // 方向，horizontal OR vertical
        orientation: 'horizontal',
        step: 1,
        min: 0,
        max: 10,
        // 数组：---o--------o----
        // 单值：------------o----
        value: 0,
        // 最小刻度间距，小于此间距将不会显示刻度
        scale: 20
    };
    var Range = ui.create({
        constructor: function ($parent, options) {
            var the = this;

            the._$screen = selector.query($parent)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the.destroyed = false;
            the.className = 'range';
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
        },


        /**
         * 更新内容，尺寸等
         */
        update: function () {
            var the = this;
            var options = the._options;

            the._maxInner = attribute.innerWidth(the._$screen);

            var scale = the._maxInner / the._steps;

            attribute.css(the._$scale, 'display', scale < options.scale ? 'none' : 'block');
            the._pos0 = the._calPos(the._value0);
            the._pos1 = the._calPos(the._value1);
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;

            the._steps = (options.max - options.min) / options.step;

            var data = {
                isDouble: the._isDouble
            };

            data.list = new Array(the._steps);
            the._$screen.innerHTML = tpl.render(data);

            var nodes = selector.query('.j-flag', the._$screen);

            the._$inner = nodes[0];
            the._$scale = nodes[1];
            the._$fg = nodes[2];
            the._$control0 = nodes[3];
            the._$control1 = nodes[4];
            the.update();
            the._update(0, the._value0 = options.value[0]);
            the._update(1, the._value1 = options.value[the._isDouble ? 1 : 0]);
            the._pos0 = the._calPos(the._value0);
            the._pos1 = the._calPos(the._value1);
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;
            var min;
            var max;
            var upBar = function (pos0, pos1) {
                attribute.css(the._$fg, {
                    left: the._isDouble ? pos0 : 0,
                    width: the._isDouble ? pos1 - pos0 : pos0
                });
            };

            event.on(the._$control0, 'dragstart', function () {
                the._toggleActive(this, true);
                max = the._calPos(the._isDouble ? the._value1 - options.step : options.max);
                return false;
            });

            event.on(the._$control0, 'drag', function (eve) {
                var now = the._pos0 + eve.alienDetail.deltaX;

                if (now > max) {
                    now = max;
                } else if (now < 0) {
                    now = 0;
                }

                attribute.css(this, 'left', now);
                upBar(now, the._pos1);
                the._onchange(the._calVal(now), the._value1);

                return false;
            });

            event.on(the._$control0, 'dragend', function (eve) {
                the._update(0, the._calVal(the._pos0 + eve.alienDetail.deltaX));
                the._pos0 = the._calPos(the._value0);
                the._toggleActive(this, false);
                return false;
            });

            if (the._$control1) {
                event.on(the._$control1, 'dragstart', function () {
                    the._toggleActive(this, true);
                    min = the._calPos(the._isDouble ? the._value0 + options.step : options.max);
                    max = the._calPos(options.max);
                    return false;
                });

                event.on(the._$control1, 'drag', function (eve) {
                    var now = the._pos1 + eve.alienDetail.deltaX;

                    if (now < min) {
                        now = min;
                    } else if (now > max) {
                        now = max;
                    }

                    attribute.css(this, 'left', now);
                    upBar(the._pos0, now);
                    the._onchange(the._value0, the._calVal(now));

                    return false;
                });

                event.on(the._$control1, 'dragend', function (eve) {
                    the._update(1, the._calVal(the._pos1 + eve.alienDetail.deltaX));
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
        _onchange: function (val0, val1) {
            var the = this;
            var change = function () {
                the.emit('change', the._isDouble ? {
                    min: the._value0,
                    max: the._value1
                } : {
                    min: the._options.min,
                    max: the._value0
                });
            };

            if (val0 !== the._value0 || val1 !== the._value1) {
                the._value0 = val0;
                the._value1 = val1;
                change();
            }
        },


        /**
         * 改变数据
         * @param value {Number|Array} 值
         */
        change: function (value) {
            var the = this;
            var options = the._options;

            value = typeis.number(value) ? [value] : value;

            if (the._isDouble) {
                if (value[0] > value[1]) {
                    value[2] = value[0];
                    value[0] = value[1];
                    value[1] = value[2];
                }

                if (value[1] - value[0] >= options.step) {
                    the._value0 = the._adjustVal(value[0]);
                    the._value1 = the._adjustVal(value[1]);
                    the._update(0, value[0]);
                    the._update(1, value[1]);
                }
            } else {
                the._value0 = the._adjustVal(value[0])
                the._update(0, value[0]);
            }
        },


        /**
         * 更新滑块 + 轨道
         * @param index
         * @param val
         * @private
         */
        _update: function (index, val) {
            var the = this;
            var options = the._options;

            val = the._adjustVal(val);

            if (index === 0) {
                if (the._isDouble && val >= the._value1) {
                    val = the._value1 - options.step;
                }

                attribute.css(the._$control0, 'left', (val * 100 / options.max) + '%');
                the._pos0 = the._calPos(val);
                the._upBar(val, the._value1);
            } else {
                if (val <= the._value0) {
                    val = the._value0 + options.step;
                }

                attribute.css(the._$control1, 'left', (val * 100 / options.max) + '%');
                the._pos1 = the._calPos(val);
                the._upBar(the._value0, val);
            }
        },


        /**
         * 更新 bar 的长度和边距
         * @param val0 {Number} 小值
         * @param val1 {Number} 大值
         * @private
         */
        _upBar: function (val0, val1) {
            var the = this;
            var options = the._options;

            if (the._isDouble) {
                attribute.css(the._$fg, {
                    left: (val0 * 100 / options.max) + '%',
                    width: ((val1 - val0) * 100 / options.max) + '%'
                });
            } else {
                attribute.css(the._$fg, {
                    left: 0,
                    width: (val0 * 100 / options.max) + '%'
                });
            }
        },


        /**
         * 切换是否 active
         * @param $ele
         * @param boolean
         * @private
         */
        _toggleActive: function ($ele, boolean) {
            var the = this;
            var className = alienClass + '-control-active';

            attribute.css($ele, 'transition', boolean ? 'none' : '');
            attribute.css(the._$fg, 'transition', boolean ? 'none' : '');
            attribute[(boolean ? 'add' : 'remove') + 'Class']($ele, className);
        },


        /**
         * 计算位置
         * @param val
         * @returns {number}
         * @private
         */
        _calPos: function (val) {
            var the = this;
            var options = the._options;

            return val * the._maxInner / (options.max - options.min);
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

            if (val < options.min) {
                val = options.min;
            } else if (val > options.max) {
                val = options.max;
            }

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
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            event.un(the._$control0, 'dragstart drag dragend');
            event.un(the._$control1, 'dragstart drag dragend');
            the._$screen.innerHTML = '';
        }
    });

    Range.defaults = defaults;
    ui.importStyle(style);
    module.exports = Range;
});