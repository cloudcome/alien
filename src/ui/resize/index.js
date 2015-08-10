/*!
 * 拖拽尺寸
 * @author ydr.me
 * @create 2014-10-29 09:46
 */


define(function (require, exports, module) {
    /**
     * @module ui/resize/
     * @requires ui/
     * @requires utils/dato
     * @requires libs/template
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/drag
     */
    'use strict';

    var ui = require('../');
    var style = require('./style.css', 'css');
    var template = require('./template.html', 'html');
    var dato = require('../../utils/dato.js');
    var Template = require('../../libs/template.js');
    var tpl = new Template(template);
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/drag.js');
    var alienIndex = 1;
    var namespace = 'alien-ui-resize';
    var defaults = {
        minWidth: 0,
        minHeight: 0,
        maxWidth: 0,
        maxHeight: 0,
        ratio: 0
    };
    /**
     * 实例化一个可拖拽改变尺寸的元素
     * @param $ele {String|HTMLElement} 被改变尺寸的元素
     * @param options {Object} 配置
     * @param [options.minWidth=0] {Number} 最小宽度
     * @param [options.minHeight=0] {Number} 最小高度
     * @param [options.maxWidth=0] {Number} 最大宽度
     * @param [options.maxHeight=0] {Number} 最大高度
     * @param [options.ratio=0] {Number} 指定宽高比
     */
    var Resize = ui.create({
        constructor: function ($ele, options) {
            var the = this;

            $ele = selector.query($ele);
            the._$ele = $ele[0];
            the._options = dato.extend(!0, {}, defaults, options);
            var pos = attribute.css(the._$ele, 'position');
            var $wrap;

            the._id = alienIndex++;
            the._$wrap = $wrap = modification.parse(tpl.render({
                id: the._id
            }))[0];

            // 必须先有定位属性
            if (pos === 'static') {
                attribute.css(the._$ele, 'position', 'relative');
            }

            modification.insert($wrap, the._$ele, 'beforeend');
            the.destroyed = false;
            the._$e = selector.query('.' + namespace + '-e', $wrap)[0];
            the._$s = selector.query('.' + namespace + '-s', $wrap)[0];
            the._size = {
                width: attribute.innerWidth(the._$ele),
                height: attribute.innerHeight(the._$ele)
            };
            the._disabled = false;
            the._on();
        },


        _on: function () {
            var the = this;

            // 2向: 东、南
            the._onresize(the._$e, 'x', 'width', 'y', 'height');
            the._onresize(the._$s, 'y', 'height', 'x', 'width');
        },


        _un: function () {
            var the = this;

            event.un('dragstart', the._$e);
            event.un('dragstart', the._$s);
            event.un('drag', the._$e);
            event.un('drag', the._$s);
            event.un('dragend', the._$e);
            event.un('dragend', the._$s);
        },


        _onresize: function ($drag, axis, prop, axis2, prop2) {
            var the = this;
            var x0;
            var y0;
            var inDrag = false;
            var val0;
            var options = the._options;
            var min;
            var max;
            var upperCase = _upCaseFirstWord(prop);
            var isWidth = prop === 'width';
            var upperCase2 = _upCaseFirstWord(prop2);

            event.on($drag, 'dragstart', function (eve) {
                eve.preventDefault();

                if (!inDrag && !the._disabled) {
                    inDrag = !0;
                    x0 = eve.pageX;
                    y0 = eve.pageY;
                    the._size = {
                        width: attribute.innerWidth(the._$ele),
                        height: attribute.innerHeight(the._$ele)
                    };
                    val0 = the._size[prop];
                    min = options['min' + upperCase];
                    max = options['max' + upperCase];

                    /**
                     * 尺寸改变前
                     * @event resizestart
                     * @param size {{width:Number,height:Number}} 尺寸
                     */
                    the.emit('resizestart', the._size);
                }
            });

            event.on($drag, 'drag', function (eve) {
                var delta;
                var val;
                var val2;

                eve.preventDefault();

                if (inDrag) {
                    delta = {
                        x: eve.pageX - x0,
                        y: eve.pageY - y0
                    };

                    val = val0 + delta[axis];

                    if (val < min) {
                        val = min;
                    } else if (max && val > max) {
                        val = max;
                    }

                    the._size[prop] = val;
                    attribute['inner' + upperCase](the._$ele, val);

                    if (options.ratio) {
                        attribute['inner' + upperCase2](the._$ele, val2 = isWidth ? val / options.ratio : val * options.ratio);
                        the._size[prop2] = val2;
                    }

                    /**
                     * 尺寸改变中
                     * @event resize
                     * @param size {{width:Number,height:Number}} 尺寸
                     */
                    the.emit('resize', the._size);
                }
            });

            event.on($drag, 'dragend', function (eve) {
                eve.preventDefault();

                if (inDrag) {
                    inDrag = false;

                    /**
                     * 尺寸改变后
                     * @event resizeend
                     * @param size {{width:Number,height:Number}} 尺寸
                     */
                    the.emit('resizeend', the._size);
                }
            });
        },


        /**
         * 启动拖动尺寸
         */
        enable: function () {
            var the = this;

            the._disabled = false;

            return the;
        },


        /**
         * 禁止拖动尺寸
         */
        disable: function () {
            var the = this;

            the._disabled = true;

            return the;
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
            the._un();
            modification.remove(the._$wrap);
        }
    });
    Resize.defaults = defaults;
    ui.importStyle(style);
    module.exports = Resize;


    /**
     * 大写第一个字母
     * @param str
     * @returns {string}
     * @private
     */
    function _upCaseFirstWord(str) {
        return str[0].toUpperCase() + str.slice(1);
    }
});