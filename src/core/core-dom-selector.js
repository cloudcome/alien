/*!
 * core-dom-selector.js
 * @author ydr.me
 * 2014-09-14 17:23
 */


define(function (require, exports, module) {
    'use strict';

    var utilData = require('../util/util-data.js');

    module.exports = {
        /**
         * 在上下文中查找DOM元素，永远返回一个数组
         * @param {String}  selector  选择器
         * @param {Element} [context] 上下文
         * @return Array
         */
        query: function (selector, context) {
            context = context || document;

            return _toArray(context.querySelectorAll(selector));
        },

        /**
         * 获取当前元素的其他兄弟元素
         * @param {Element} element
         * @returns {Array}
         */
        siblings: function (element) {
            var ret = [];
            var parent = element.parentNode;
            var childrens = _toArray(parent.children);

            utilData.each(childrens, function (index, child) {
                // 这里不能用 isEqualNode
                // <ul>
                //    <li></li>
                //    <li></li>
                //    <li></li>
                // </ul>
                // isEqual 三个li都返回true
                // ===     三个li返回值才正常
                if (child !== element) {
                    ret.push(child);
                }
            });

            return ret;
        },
        /**
         * 获取当前元素的索引值
         * @param {Element} element
         * @returns {number}
         */
        index: function (element) {
            var ret = -1;
            var parent = element.parentNode;
            var childrens = _toArray(parent.children);

            utilData.each(childrens, function (index, child) {
                // 这里不能用 isEqualNode
                // <ul>
                //    <li></li>
                //    <li></li>
                //    <li></li>
                // </ul>
                // isEqual 三个li都返回true
                // ===     三个li返回值才正常
                if (child === element) {
                    ret = index;
                    return !1;
                }
            });

            return ret;
        }
        // equal: function (element1, element2) {
        //     return element1.isEqualNode(element2);
        // },
        // matches: function (element, selector) {
        //     element.matches(selector);
        // }
    };

    /**
     * 将类数组转换为数组
     * @param object
     * @returns {Array}
     * @private
     */
    function _toArray(object) {
        return [].slice.call(object);
    }
});