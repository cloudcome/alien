/*!
 * 拖拽尺寸
 * @author ydr.me
 * @create 2014-10-29 09:46
 */


define(function (require, exports, module) {
    /**
     * @module ui/Resize/index
     * @requires util/class
     * @requires util/dato
     * @requires libs/Template
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/drag
     * @requires ui/generator
     */
    'use strict';

    var style = require('text!./style.css');
    var template = require('text!./template.html');
    var generator = require('../generator.js');
    var dato = require('../../util/dato.js');
    var Emitter = require('../../libs/Emitter.js');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/drag.js');
    var alienIndex = 1;
    var alienPrefix = 'alien-ui-resize';
    var defaults = {
        minWidth: 0,
        minHeight: 0,
        maxWidth: 0,
        maxHeight: 0,
        ratio: 0
    };
    var Resize = generator({
        STATIC: {
            defaults: defaults
        },
        constructor: function ($ele, options) {
            var the = this;

            $ele = selector.query($ele);

            if (!$ele.length) {
                throw 'instance element is empty';
            }

            the._$ele = $ele[0];
            the._options = dato.extend(!0, {}, defaults, options);
            the._init();
        },
        _init: function () {
            var the = this;
            var $ele = the._$ele;
            var pos = attribute.css($ele, 'position');
            var $wrap;

            the._id = alienIndex++;
            the._$wrap = $wrap = modification.parse(tpl.render({
                id: the._id
            }))[0];

            // 必须先有定位属性
            if (pos === 'static') {
                attribute.css($ele, 'position', 'relative');
            }

            modification.insert($wrap, $ele, 'beforeend');
            the._$e = selector.query('.' + alienPrefix + '-e', $wrap)[0];
            the._$s = selector.query('.' + alienPrefix + '-s', $wrap)[0];
            the._pos = {
                width: attribute.innerWidth($ele),
                height: attribute.innerHeight($ele)
            };
            the._disabled = !1;
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
            var inDrag = !1;
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
                    the._pos = {
                        width: attribute.innerWidth(the._$ele),
                        height: attribute.innerHeight(the._$ele)
                    };
                    val0 = the._pos[prop];
                    min = options['min' + upperCase];
                    max = options['max' + upperCase];
                    the.emit('resizestart', the._pos);
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

                    the._pos[prop] = val;
                    attribute['inner' + upperCase](the._$ele, val);

                    if (options.ratio) {
                        attribute['inner' + upperCase2](the._$ele, val2 = isWidth ? val / options.ratio : val * options.ratio);
                        the._pos[prop2] = val2;
                    }

                    the.emit('resize', the._pos);
                }
            });

            event.on($drag, 'dragend', function (eve) {
                eve.preventDefault();

                if (inDrag) {
                    inDrag = !1;
                    the.emit('resizeend', the._pos);
                }
            });
        },
        /**
         * 启动拖动尺寸
         * @returns {Resize}
         */
        enable: function () {
            var the = this;

            the._disabled = !1;

            return the;
        },
        /**
         * 禁止拖动尺寸
         * @returns {Resize}
         */
        disable: function () {
            var the = this;

            the._disabled = !0;

            return the;
        },
        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            the._un();
            modification.remove(the._$wrap);
        }
    });

    modification.importStyle(style);
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