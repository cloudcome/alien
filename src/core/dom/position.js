/*!
 * position.js
 * @author ydr.me
 * @create 2014-09-28 13:27
 */


define(function (require, exports, module) {
    /**
     * @module core/dom/position
     * @requires util/data
     * @requires core/dom/attribute
     */
    'use strict';

    var data = require('../../util/data.js');
    var attribute = require('./attribute.js');

    module.exports = {
        /**
         * 获取、设置元素距离文档边缘的 top 距离
         * @param {Element} ele
         * @param {Number} [val] 距离值
         * @returns {Number|undefined|*}
         *
         * @example
         * // set
         * position.top(ele, 100);
         *
         * // get
         * position.top(ele);
         */
        top: function () {
            return _middleware(arguments, {
                get: function (ele) {
                    return ele.getBoundingClientRect().top;
                },
                set: function (ele, val) {
                    _setBoundingClientRect(ele, 'top', val);
                }
            });
        },


        /**
         * 获取、设置元素距离文档边缘的 left 距离
         * @param {Element} ele
         * @param {Number} [val] 距离值
         * @returns {Number|undefined|*}
         *
         * @example
         * // set
         * position.left(ele, 100);
         *
         * // get
         * position.left(ele);
         */
        left: function () {
            return _middleware(arguments, {
                get: function (ele) {
                    return ele.getBoundingClientRect().left;
                },
                set: function (ele, val) {
                    _setBoundingClientRect(ele, 'left', val);
                }
            });
        },


        /**
         * 获取、设置元素的占位宽度
         * content-box: cssWidth + padding + border
         * border-box:  cssWidth
         * @param {Element} ele
         * @param {Number} [val] 宽度值
         * @returns {Number|undefined|*}
         *
         * @example
         * // set
         * position.width(ele, 100);
         *
         * // get
         * position.width(ele);
         */
        width: function () {
            return _middleware(arguments, {
                get: function (ele) {
                    return ele.getBoundingClientRect().width;
                },
                set: function (ele, val) {
                    _setBoundingClientRect(ele, 'width', val);
                }
            });
        },


        /**
         * 获取、设置元素的占位高度
         * content-box: cssHeight + padding + border
         * border-box:  cssHeight
         * @param {Element} ele
         * @param {Number} [val] 高度值
         * @returns {Number|undefined|*}
         *
         * @example
         * // set
         * position.height(ele, 100);
         *
         * // get
         * position.height(ele);
         */
        height: function () {
            return _middleware(arguments, {
                get: function (ele) {
                    return ele.getBoundingClientRect().height;
                },
                set: function (ele, val) {
                    _setBoundingClientRect(ele, 'height', val);
                }
            });
        }
    };


    /**
     * 中间件
     * @param {Array} args 参数数组
     * @param {Object} getSet 函数对象
     * @returns {Number|undefined|*}
     * @private
     */
    function _middleware(args, getSet) {
        var ele;
        var argsLength = args.length;

        if (argsLength) {
            ele = args[0];

            if (data.type(ele) !== 'element') {
                return;
            }

            if (argsLength === 1) {
                return getSet.get(ele);
            } else if (argsLength === 2) {
                getSet.set(ele, args[1]);
            }
        }
    }


    /**
     * 格式化字符串为数字
     * @param {*} number
     * @returns {Number} NaN 返回0，其他正常返回
     * @private
     */
    function _parseFloat(number) {
        var number = parseFloat(number);

        if (isNaN(number)) {
            return 0;
        }

        return number;
    }


    /**
     * 设置元素的位置
     * @param {Element} ele 元素
     * @param {String} key 键名
     * @param {Number} val 键值
     * @private
     */
    function _setBoundingClientRect(ele, key, val) {
        val = _parseFloat(val);

        var rect = ele.getBoundingClientRect();
        var now = rect[key];
        var width = rect.width;
        var height = rect.height;
        var deleta = val - now;
        var css;

        if (attribute.css(ele, 'position') === 'static' && key !== 'width' && key !== 'height') {
            css = _parseFloat(attribute.css(ele, 'margin-' + key));
            attribute.css(ele, 'margin-' + key, css + deleta);
        } else {
            css = _parseFloat(attribute.css(ele, key));
            attribute.css(ele, key, css + deleta);
        }
    }
});