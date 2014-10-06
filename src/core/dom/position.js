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
            return _middleware('top', arguments);
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
            return _middleware('left', arguments);
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
            return _middleware('width', arguments);
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
            return _middleware('height', arguments);
        }
    };


    /**
     * 中间件
     * @param {String} key 求值类型
     * @param {Array} args 参数数组
     * @param {Object} getSet 函数对象
     * @returns {Number|undefined|*}
     * @private
     */
    function _middleware(key, args) {
        var ele;
        var eleType;
        var argsLength = args.length;

        if (argsLength) {
            ele = args[0];
            eleType = data.type(ele);

            // 切换显隐
            return _swap(ele, function () {
                // get
                if (argsLength === 1) {
                    switch (eleType) {
                        case 'element':
                            return ele.getBoundingClientRect()[key];

                        case 'window':
                            return window['inner' + (key === 'width'?'Width':'Height')];

                        case 'document':
                            return document.documentElement.getBoundingClientRect()[key];
                    }
                }
                // set
                else if (argsLength === 2 && eleType === 'element' && data.type(args[1]) === 'number') {
                    _setBoundingClientRect(ele, key, args[1]);
                }
            });
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

    /**
     * 切换显隐状态来计算元素尺寸
     * @param {HTMLElement} ele 元素
     * @param {Function} doWhat 做
     * @private
     */
    function _swap(ele, doWhat) {
        var eles;
        var ret;

        if(attribute.state(ele) === 'show'){
            return doWhat(ele);
        }else{
            eles = attribute.state(ele, 'show');

            ret = doWhat(ele);

            data.each(eles, function (index, ele) {
                ele.style.display = '';
            });

            return ret;
        }
    }
});