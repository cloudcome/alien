/*!
 * 核心 dom 选择器
 * @author ydr.me
 * 2014-09-14 17:23
 */


define(function (require, exports, module) {
    /**
     * 选择器返回结果全部都是数组，即使是返回的只有1个元素
     *
     * @module core/dom/selector
     * @requires utils/dato
     * @requires utils/typeis
     * @requires core/navigator/compatible
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var random = require('../../utils/random.js');
    var compatible = require('../navigator/compatible.js');
    var matchesSelector = compatible.html5('matchesSelector', document.body);
    var win = window;
    var doc = win.document;


    /**
     * 在上下文中查找DOM元素，永远返回一个数组
     * @param {String|HTMLElement|NodeList}  selector  选择器
     * @param {Object} [context=document] 上下文
     * @return {Array}
     *
     * @example
     * selector.query('body');
     * // => [HTMLBODYElement]
     * selector.query('div');
     * // => [div, div, ...]
     */
    exports.query = function (selector, context) {
        context = context || doc;

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
                    if (context === doc) {
                        ret = selector;
                    } else {
                        ret = context.contains(selector) ? selector : [];
                    }
                    break;

                default :
                    ret = selector;
            }

            return dato.toArray(ret, true);
        } else {
            throw new Error('query context must be an element');
        }
    };


    /**
     * 判断元素是否包含关系
     * @param $child {Object} 子元素
     * @param $parent {Object} 父元素
     * @returns {Boolean}
     */
    exports.contains = function ($child, $parent) {
        if ($parent === doc) {
            return true;
        }

        return $parent.contains($child);
    };


    /**
     * 获取当前元素的其他兄弟元素
     * @param {Object} ele 元素
     * @returns {Array}
     *
     * @example
     * selector.siblings(ele);
     * // => [div, div, ...];
     */
    exports.siblings = function (ele) {
        if (!ele || !ele.nodeType) {
            return [];
        }

        var ret = [];
        var parent = ele.parentNode;
        var childrens = dato.toArray(parent.children, true);

        dato.each(childrens, function (index, child) {
            if (child !== ele) {
                ret.push(child);
            }
        });

        return ret;
    };


    /**
     * 获取当前元素的索引值
     * @param {Object} ele 元素
     * @returns {number} 未匹配到位-1，匹配到为[0,+∞)
     *
     * @example
     * selector.index(ele);
     * // find => [0,+∞)
     * // unfind => -1
     */
    exports.index = function (ele) {
        if (!ele || !ele.nodeType) {
            return -1;
        }

        var ret = -1;
        var parent = ele.parentNode;
        var childrens = dato.toArray(parent.children, true);

        dato.each(childrens, function (index, child) {
            if (child === ele) {
                ret = index;
                return false;
            }
        });

        return ret;
    };


    /**
     * 获取元素的上一个兄弟元素
     * @param {Object} ele 元素
     * @returns {Array}
     *
     * @example
     * selector.prev(ele);
     * // => [div];
     */
    exports.prev = function (ele) {
        if (!ele || !ele.nodeType) {
            return [];
        }

        return dato.toArray(ele.previousElementSibling, true);
    };


    /**
     * 获取元素的下一个兄弟元素
     * @param {Object} ele 元素
     * @returns {Array}
     *
     * @example
     * selector.next(ele);
     * // => [div];
     */
    exports.next = function (ele) {
        if (!ele || !ele.nodeType) {
            return [];
        }

        return dato.toArray(ele.nextElementSibling, true);
    };


    // prevAll: function(){
    //
    // },
    // nextAll: function(){
    //
    // },


    /**
     * 从元素本身开始获得最近匹配的祖先元素
     * @param {Object} ele 元素
     * @param {String|Object} selector 选择器
     * @returns {Array}
     *
     * @example
     * selector.closest(ele, 'div');
     * // => [div];
     */
    exports.closest = function (ele, selector) {
        if (!ele || !ele.nodeType) {
            return [];
        }

        if (typeis.string(selector)) {
            while (typeis(ele) !== 'document' && typeis(ele) === 'element') {
                if (exports.isMatched(ele, selector)) {
                    return dato.toArray(ele, true);
                }

                ele = exports.parent(ele)[0];
            }
        } else if (typeis.element(selector)) {
            while (typeis(ele) !== 'document' && ele && ele !== selector) {
                if (ele === selector) {
                    return dato.toArray(ele, true);
                }

                ele = exports.parent(ele)[0];
            }
        }

        return dato.toArray();
    };


    /**
     * 获得父级元素
     * @param {Object} ele 元素
     * @returns {Array}
     *
     * @example
     * selector.parent(ele);
     * // => [div];
     */
    exports.parent = function (ele) {
        if (!ele || !ele.nodeType) {
            return [];
        }

        return dato.toArray(ele.parentNode || ele.parentElement, true);
    };


    /**
     * 获取子元素
     * @param {Object} ele 元素
     * @returns {Array}
     *
     * @example
     * selector.children(ele);
     * // => [div, div, ...];
     */
    exports.children = function (ele) {
        if (!ele || !ele.nodeType) {
            return [];
        }

        return dato.toArray(ele.children, true);
    };


    /**
     * 获取子节点
     * @param {Object} ele 元素
     * @returns {Array}
     *
     * @example
     * selector.contents(ele);
     * // => [div, div, ...];
     */
    exports.contents = function (ele) {
        if (!ele || !ele.nodeType) {
            return [];
        }

        return dato.toArray(ele.contentDocument ? ele.contentDocument : ele.childNodes, true);
    };


    /**
     * 元素与选择器是否匹配
     * @param {Object} ele 元素
     * @param {String} selector 选择器
     * @returns {Boolean}
     *
     * @example
     * selector.isMatched(ele, 'div');
     * // => true OR false
     */
    exports.isMatched = function (ele, selector) {
        return typeis(ele) !== 'element' ? false : ele[matchesSelector](selector);
    };


    /**
     * 过滤节点集合
     * @param {Array|NodeList} nodeList 节点集合
     * @param {Function} filter 过滤方法，返回true选择该节点
     * @returns {Array} 过滤后的节点集合
     *
     * @example
     * selector.filter(ele, function(){
     *     return this.nodeName === 'DIV';
     * });
     * // => [div, div, ...]
     */
    exports.filter = function (nodeList, filter) {
        var ret = [];

        dato.each(nodeList, function (index, node) {
            if (filter.call(node, index, node) === true) {
                ret.push(node);
            }
        });

        return ret;
    };


    /**
     * 判断上下文是否存在某元素
     * @param ele {Element} 元素
     * @param context {Object} 上下文
     * @returns {boolean}
     */
    exports.has = function (ele, context) {
        context = context || doc;

        if (ele === context) {
            return true;
        }

        var className = random.string(20) + Date.now();

        ele.classList.add(className);

        var list = exports.query('.' + className, context);

        ele.classList.remove(className);

        return list.length > 0;
    };
});
