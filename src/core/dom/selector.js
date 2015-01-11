/*!
 * core-dom-selector.js
 * @author ydr.me
 * 2014-09-14 17:23
 */


define(function (require, exports, module) {
    /**
     * 选择器返回结果全部都是数组，即使是返回的只有1个元素
     *
     * @module core/dom/selector
     * @requires util/dato
     * @requires util/typeis
     * @requires core/navigator/compatible
     */
    'use strict';

    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var compatible = require('../navigator/compatible.js');
    var matchesSelector = compatible.html5('matchesSelector', document.body);

    module.exports = {
        /**
         * 在上下文中查找DOM元素，永远返回一个数组
         * @param {String}  selector  选择器
         * @param {HTMLElement|Node} [context] 上下文
         * @return {Array}
         *
         * @example
         * selector.query('body');
         * // => [HTMLBODYElement]
         * selector.query('div');
         * // => [div, div, ...]
         */
        query: function (selector, context) {
            context = context || document;

            var selectorType = typeis(selector);
            var ret = [];

            if (context && (context.nodeType === 1 || context.nodeType === 9)) {
                switch (selectorType) {
                    case 'string':
                        selector = selector.trim();
                        try {
                            ret = selector ? context.querySelectorAll(selector) : [];
                        } catch (err) {
                            ret = [];
                        }
                        break;

                    case 'element':
                    case 'document':
                        ret = context.contains(selector) ? [selector] : [];
                        break;

                    case 'window':
                        ret = window;
                        break;
                }

                return dato.toArray(ret, true);
            } else {
                throw new Error('query context must be an element');
            }
        },

        /**
         * 获取当前元素的其他兄弟元素
         * @param {HTMLElement|Node} ele 元素
         * @returns {Array}
         *
         * @example
         * selector.siblings(ele);
         * // => [div, div, ...];
         */
        siblings: function (ele) {
            if (!ele || !ele.nodeType) {
                return [];
            }

            var ret = [];
            var parent = ele.parentNode;
            var childrens = dato.toArray(parent.children, !0);

            dato.each(childrens, function (index, child) {
                if (child !== ele) {
                    ret.push(child);
                }
            });

            return ret;
        },

        /**
         * 获取当前元素的索引值
         * @param {HTMLElement|Node} ele 元素
         * @returns {number} 未匹配到位-1，匹配到为[0,+∞)
         *
         * @example
         * selector.index(ele);
         * // find => [0,+∞)
         * // unfind => -1
         */
        index: function (ele) {
            if (!ele || !ele.nodeType) {
                return -1;
            }

            var ret = -1;
            var parent = ele.parentNode;
            var childrens = dato.toArray(parent.children, !0);

            dato.each(childrens, function (index, child) {
                if (child === ele) {
                    ret = index;
                    return !1;
                }
            });

            return ret;
        },

        /**
         * 获取元素的上一个兄弟元素
         * @param {HTMLElement|Node} ele 元素
         * @returns {Array}
         *
         * @example
         * selector.prev(ele);
         * // => [div];
         */
        prev: function (ele) {
            if (!ele || !ele.nodeType) {
                return [];
            }

            return dato.toArray(ele.previousElementSibling, !0);
        },
        /**
         * 获取元素的下一个兄弟元素
         * @param {HTMLElement|Node} ele 元素
         * @returns {Array}
         *
         * @example
         * selector.next(ele);
         * // => [div];
         */
        next: function (ele) {
            if (!ele || !ele.nodeType) {
                return [];
            }

            return dato.toArray(ele.nextElementSibling, !0);
        },
        // prevAll: function(){
        //
        // },
        // nextAll: function(){
        //
        // },
        /**
         * 获得元素的最近匹配祖先元素或子代元素集合
         * @param {HTMLElement|Node} ele 元素
         * @param {String} selector 选择器
         * @returns {Array}
         *
         * @example
         * selector.closest(ele);
         * // => [div];
         */
        closest: function (ele, selector) {
            if (!ele || !ele.nodeType) {
                return [];
            }

            var the = this;

            while (typeis(ele) !== 'document' && typeis(ele) === 'element') {
                if (the.isMatched(ele, selector)) {
                    return dato.toArray(ele, !0);
                }

                ele = this.parent(ele)[0];
            }

            return dato.toArray();
        },
        /**
         * 获得父级元素
         * @param {HTMLElement|Node} ele 元素
         * @returns {Array}
         *
         * @example
         * selector.parent(ele);
         * // => [div];
         */
        parent: function (ele) {
            if (!ele || !ele.nodeType) {
                return [];
            }

            return dato.toArray(ele.parentNode || ele.parentElement, !0);
        },
        /**
         * 获取子元素
         * @param {HTMLElement|Node} ele 元素
         * @returns {Array}
         *
         * @example
         * selector.children(ele);
         * // => [div, div, ...];
         */
        children: function (ele) {
            if (!ele || !ele.nodeType) {
                return [];
            }

            return dato.toArray(ele.children, !0);
        },

        /**
         * 获取子节点
         * @param {HTMLElement|Node} ele 元素
         * @returns {Array}
         *
         * @example
         * selector.contents(ele);
         * // => [div, div, ...];
         */
        contents: function (ele) {
            if (!ele || !ele.nodeType) {
                return [];
            }

            return dato.toArray(ele.contentDocument ? ele.contentDocument : ele.childNodes, !0);
        },

        /**
         * 元素与选择器是否匹配
         * @param {HTMLElement|Node} ele 元素
         * @param {String} selector 选择器
         * @returns {Boolean}
         *
         * @example
         * selector.isMatched(ele, 'div');
         * // => true OR false
         */
        isMatched: function (ele, selector) {
            return typeis(ele) !== 'element' ? !1 : ele[matchesSelector](selector);
        },

        /**
         * 过滤节点集合
         * @param {Node} nodeList   节点集合
         * @param {Function} filter 过滤方法，返回true选择该节点
         * @returns {Array} 过滤后的节点集合
         *
         * @example
         * selector.filter(ele, function(){
         *     return this.nodeName === 'DIV';
         * });
         * // => [div, div, ...]
         */
        filter: function (nodeList, filter) {
            var ret = [];

            dato.each(nodeList, function (index, node) {
                if (filter.call(node)) {
                    ret.push(node);
                }
            });

            return ret;
        }
    };
});
