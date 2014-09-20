/*!
 * core-dom-selector.js
 * @author ydr.me
 * 2014-09-14 17:23
 */


define(function (require, exports, module) {
    /**
     * @module core/dom/selector
     */
    'use strict';

    var data = require('../../util/data.js');
    var compatible = require('../../util/compatible.js');
    var howdo = require('../../util/howdo.js');
    var udf;
    var matchesSelector = compatible.html5('matchesSelector', document.body);

    module.exports = {
        /**
         * 在上下文中查找DOM元素，永远返回一个数组
         * @param {String}  selector  选择器
         * @param {HTMLElement|Node} [context] 上下文
         * @return {Array}
         */
        query: function query(selector, context) {
            context = context || document;

            return data.toArray(context.querySelectorAll(selector), !0);
        },

        /**
         * 获取当前元素的其他兄弟元素
         * @param {HTMLElement|Node} element 元素
         * @returns {Array}
         */
        siblings: function siblings(element) {
            var ret = [];
            var parent = element.parentNode;
            var childrens = data.toArray(parent.children, !0);

            data.each(childrens, function (index, child) {
                if (child !== element) {
                    ret.push(child);
                }
            });

            return ret;
        },
        /**
         * 获取当前元素的索引值
         * @param {HTMLElement|Node} element 元素
         * @returns {number} 未匹配到位-1，匹配到为[0,+∞)
         */
        index: function index(element) {
            var ret = -1;
            var parent = element.parentNode;
            var childrens = data.toArray(parent.children, !0);

            data.each(childrens, function (index, child) {
                if (child === element) {
                    ret = index;
                    return !1;
                }
            });

            return ret;
        },
        /**
         * 获取元素的上一个兄弟元素
         * @param {HTMLElement|Node} element 元素
         * @returns {Array}
         */
        prev: function prev(element) {
            return data.toArray(element.previousElementSibling, !0);
        },
        /**
         * 获取元素的下一个兄弟元素
         * @param {HTMLElement|Node} element 元素
         * @returns {Array}
         */
        next: function next(element) {
            return data.toArray(element.nextElementSibling, !0);
        },
        // prevAll: function(){
        //
        // },
        // nextAll: function(){
        //
        // },
        /**
         * 获得元素的最近匹配祖先元素或子代元素集合
         * @param {HTMLElement|Node} element 元素
         * @param {String} selector 选择器
         * @returns {Array}
         */
        closest: function closest(element, selector) {
            var the = this;

            while (data.type(element) !== 'document') {
                if (the.isMatched(element, selector)) {
                    return data.toArray(element, !0);
                }

                element = this.parent(element)[0];
            }

            return data.toArray();
        },
        /**
         * 获得父级元素
         * @param {HTMLElement|Node} element        元素
         * @returns {Array}
         */
        parent: function parent(element) {
            return data.toArray(element.parentNode || element.parentElement, !0);
        },
        /**
         * 获取子元素
         * @param {HTMLElement|Node} element 元素
         * @returns {Array}
         */
        children: function children(element) {
            return data.toArray(element.children, !0);
        },

        /**
         * 获取子节点
         * @param {HTMLElement|Node} element 元素
         * @returns {Array}
         */
        contents: function contents(element) {
            return data.toArray(element.contentDocument ? element.contentDocument : element.childNodes, !0);
        },
        /**
         * 元素与选择器是否匹配
         * @param {HTMLElement|Node} element 元素
         * @param {String} selector 选择器
         * @returns {Boolean}
         */
        isMatched: function isMatched(element, selector) {
            return data.type(element) !== 'element' ? !1 : element[matchesSelector](selector);
        },
        /**
         * 过滤节点集合
         * @param {Node} nodeList   节点集合
         * @param {Function} filter 过滤方法，返回true选择该节点
         * @returns {Array} 过滤后的节点集合
         */
        filter: function filter(nodeList, filter) {
            var ret = [];

            data.each(nodeList, function (index, node) {
                if (filter.call(node)) {
                    ret.push(node);
                }
            });

            return ret;
        }
    };
});