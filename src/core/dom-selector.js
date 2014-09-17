/*!
 * core-dom-selector.js
 * @author ydr.me
 * 2014-09-14 17:23
 */


define(function (require, exports, module) {
    /**
     * @module core/dom-selector
     */
    'use strict';

    var dataTraveller = require('../util/data-traveller.js');
    var browserPrfix = require('../util/browser-prefix.js');
    var udf;
    var matchesSelector = browserPrfix.html5('matchesSelector', document.body);

    module.exports = {
        /**
         * 在上下文中查找DOM元素，永远返回一个数组
         * @param {String}  selector  选择器
         * @param {HTMLElement} [context] 上下文
         * @return {Array}
         */
        query: function (selector, context) {
            context = context || document;

            return _toArray(context.querySelectorAll(selector));
        },

        /**
         * 获取当前元素的其他兄弟元素
         * @param {HTMLElement} element 元素
         * @returns {Array}
         */
        siblings: function (element) {
            var ret = [];
            var parent = element.parentNode;
            var childrens = _toArray(parent.children);

            dataTraveller.each(childrens, function (index, child) {
                if (child !== element) {
                    ret.push(child);
                }
            });

            return ret;
        },
        /**
         * 获取当前元素的索引值
         * @param {HTMLElement} element 元素
         * @returns {number} 未匹配到位-1，匹配到为[0,+∞)
         */
        index: function (element) {
            var ret = -1;
            var parent = element.parentNode;
            var childrens = _toArray(parent.children);

            dataTraveller.each(childrens, function (index, child) {
                if (child === element) {
                    ret = index;
                    return !1;
                }
            });

            return ret;
        },
        /**
         * 获取元素的上一个兄弟元素
         * @param {HTMLElement} element 元素
         * @returns {Array}
         */
        prev: function (element) {
            return _toArray(element.previousElementSibling);
        },
        /**
         * 获取元素的下一个兄弟元素
         * @param {HTMLElement} element 元素
         * @returns {Array}
         */
        next: function (element) {
            return _toArray(element.nextElementSibling);
        },
        // prevAll: function(){
        //
        // },
        // nextAll: function(){
        //
        // },
        /**
         * 获得元素的最近匹配祖先元素
         * @param {HTMLElement} element 元素
         * @param {String} selector 选择器
         * @returns {Array}
         */
        closest: function (element, selector) {
            while (element !== document) {
                if (element[matchesSelector](selector)) {
                    return _toArray(element);
                }
                element = this.parent(element)[0];
            }

            return _toArray();
        },
        /**
         * 获得父级元素
         * @param {HTMLElement} element        元素
         * @param {Boolean} [isPositionParent] 是否为已定位祖先
         * @returns {Array}
         */
        parent: function (element, isPositionParent) {
            if(isPositionParent){

            }else{
                return _toArray(element.parentNode || element.parentElement);
            }
        },
        /**
         * 获取子元素
         * @param {HTMLElement} element 元素
         * @returns {Array}
         */
        children: function (element) {
            return _toArray(element.children);
        },
        /**
         * 获取子节点
         * @param {HTMLElement} element 元素
         * @returns {Array}
         */
        contents: function (element) {
            return _toArray(element.contentDocument ? element.contentDocument : element.childNodes);
        },
        // equal: function (element1, element2) {
        //     return element1.isEqualNode(element2);
        // },
        // matches: function (element, selector) {
        //     element.matches(selector);
        // }
        /**
         * 过滤节点集合
         * @param {Node} nodeList   节点集合
         * @param {Function} filter 过滤方法，返回true选择该节点
         * @returns {Array} 过滤后的节点集合
         */
        filter: function (nodeList, filter) {
            var ret = [];

            dataTraveller.each(nodeList, function (index, node) {
                if (filter.call(node)) {
                    ret.push(node);
                }
            });

            return ret;
        }
    };

    /**
     * 将类数组转换为数组
     * @param {*} [object]
     * @returns {Array}
     * @private
     */
    function _toArray(object) {
        if (object === null || object === udf) {
            return [];
        } else if (typeof object === 'object' && object.length !== udf) {
            return [].slice.call(object);
        } else {
            return [object];
        }
    }
});