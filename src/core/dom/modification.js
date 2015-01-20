/*!
 * 核心 dom 修改器
 * @author ydr.me
 * 2014-09-16 17:02
 */


define(function (require, exports, module) {
    /**
     * @module core/dom/modification
     * @requires util/dato
     * @requires core/dom/selector
     * @requires core/dom/attribute
     */
    'use strict';

    var dato = require('../../util/dato.js');
    var domSelector = require('./selector.js');
    var attribute = require('./attribute.js');
    var regSpace = /\s+/g;
    var regDir = />/g;
    //var regComments = /\/\*+([\s\S]*?)\*+\//;
    var head = domSelector.query('head')[0] || document.documentElement;

    /**
     * 解析字符串为节点，兼容IE10+
     * @link https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
     * @param {String} htmlString
     * @returns {NodeList|HTMLElement}
     *
     * @example
     * modification.parse('&lt;div/>');
     * // => HTMLDIVElement
     */
    exports.parse = function (htmlString) {
        var parser = new DOMParser();

        return parser.parseFromString(htmlString, 'text/html').body.childNodes;
    };


    /**
     * 创建节点
     * @param {String}       nodeName       节点名称，可以为#text、#comment、tagName
     * @param {String|Object} [attributes]   节点属性
     * @param {Object} [properties]   节点特性
     * @returns {Node}
     *
     * @example
     * modification.create('#text', '123');
     * // => textNode
     *
     * modification.create('#comment', '123');
     * // => commentNode
     *
     * modification.create('div', {id:'id-123'});
     * // => DIVNode
     */
    exports.create = function (nodeName, attributes, properties) {
        var node;

        switch (nodeName) {
            case '#text':
                node = document.createTextNode(attributes);
                break;

            case '#comment':
                node = document.createComment(attributes);
                break;

            default:
                node = document.createElement(nodeName);
                dato.each(attributes, function (key, val) {
                    var styles = [];

                    if (typeof val === 'object') {
                        if (key === 'style') {
                            dato.each(val, function (k, v) {
                                var fix = attribute.fixCss(k, v);
                                styles.push(fix.key + ':' + fix.val);
                            });

                            val = styles.join(';');
                        } else {
                            try {
                                val = JSON.stringify(val);
                            } catch (err) {
                                val = '';
                            }
                        }

                        node.setAttribute(key, val);
                    } else {
                        node.setAttribute(key, val);
                    }
                });

                break;
        }

        dato.each(properties, function (key, val) {
            node[key] = val;
        });

        return node;
    };


    /**
     * 将源插入到指定的目标位置，并返回指定的元素
     * @param {Object} source 源
     * @param {Object} target 目标
     * @param {String} [position="beforeend"] 插入位置，分别为：beforebegin、afterbegin、beforeend、afterend
     * @param {Boolean} [isReturnSource] 是否返回源，默认false
     * @returns {Object|null}
     *
     * @example
     * // - beforebegin
     * // - <target>
     * //   - afterbegin
     * //   - beforeend
     * // - afterend
     *
     * // default return target
     * modification.insert(source, target, 'beforebegin');
     * modification.insert(source, target, 'afterbegin');
     * modification.insert(source, target, 'beforeend');
     * modification.insert(source, target, 'afterend');
     */
    exports.insert = function (source, target, position, isReturnSource) {
        if (!source || !source.nodeType || !target || !target.nodeType) {
            return null;
        }

        position = position || 'beforeend';

        switch (position) {
            // 源插入到目标外部之前
            case 'beforebegin':
                if (target && source && target.parentNode) {
                    target.parentNode.insertBefore(source, target);

                    return isReturnSource ? source : target;
                }

                break;

            // 源插入到目标内部最前
            case 'afterbegin':
                if (source && target) {
                    if (target.firstChild) {
                        target.insertBefore(source, target.firstChild);
                    } else {
                        target.appendChild(source);
                    }

                    return isReturnSource ? source : target;
                }

                break;

            // 源插入到目标内部最后
            case 'beforeend':
                if (target && source) {
                    target.appendChild(source);

                    return isReturnSource ? source : target;
                }

                break;

            // 源插入到目标外部之后
            case 'afterend':
                if (target && source && target.parentNode) {
                    target.nextSibling ?
                        target.parentNode.insertBefore(source, target.nextSibling) :
                        target.parentNode.appendChild(source);

                    return isReturnSource ? source : target;
                }

                break;
        }

        return null;
    };


    /**
     * 移除某个元素
     * @param {Object} ele
     *
     * @example
     * modification.remove(ele);
     */
    exports.remove = function (ele) {
        if (!ele || !ele.nodeType) {
            return false;
        }

        if (ele && ele.parentNode) {
            try {
                ele.parentNode.removeChild(ele);
            } catch (err) {
                // ignore
            }
        }
    };


    /**
     * 元素外层追加一层
     * @param {HTMLElement|Node} source 元素
     * @param {String} htmlstring html字符串
     * @returns {HTMLElement|Node|null} 如果存在返回 wrap 包裹对象，否则返回 null
     *
     * @example
     * modification.wrap(ele, '&lt;div/>');
     */
    exports.wrap = function (source, htmlstring) {
        if (!source || !source.nodeType) {
            return null;
        }

        var target = this.parse(htmlstring);
        var wrap;

        if (target.length && target[0].nodeType === 1) {
            // 这里必须复制对象
            // 因为后面的 DOM 修改会影响这里，因为 target 是一个对象引用
            wrap = dato.extend([], target);
            target = this.insert(wrap[0], source, 'beforebegin', !0);

            if (target) {
                // #div1>#div2>#div3
                // 插入到 #div3 里（最里层）
                while (target.firstElementChild) {
                    target = target.firstElementChild;
                }

                this.insert(source, target, 'beforeend');

                return wrap;
            }
        }

        return null;
    };


    /**
     * 移除源的外层元素，匹配选择器
     * @param {HTMLElement|Node} source 源
     * @param {String} selector 选择器
     *
     * @example
     * // #div1>#div2>#div3>ele
     * modification.unwrap(ele, '#div1 #div2 #div3');
     * // ele
     */
    exports.unwrap = function (source, selector) {
        var selectors = selector.trim().replace(regDir, '').split(regSpace);
        var the = this;

        // .div1 .p1 .div2
        // => .div2 .p1 .div1
        dato.each(selectors.reverse(), function (index, selector) {
            if (domSelector.isMatched(source.parentNode, selector)) {
                _removeParent(source);
            } else {
                return !1;
            }
        });

        function _removeParent(element) {
            var target = the.insert(element, element.parentNode, 'beforebegin');

            if (target) {
                the.remove(target);
            }
        }
    };


    /**
     * 添加样式
     * @param {String} styleText 样式内容
     *
     * @example
     * modification.importStyle('body{padding: 10px;}');
     */
    exports.importStyle = function (styleText) {
        var style = this.create('style');

        styleText = String(styleText);

        this.insert(style, head, 'beforeend');

        // IE
        if (style.styleSheet !== undefined) {

            // 此 BUG 仅影响 IE8（含） 以下浏览器
            // http://support.microsoft.com/kb/262161
            // if (document.getElementsByTagName('style').length > 31) {
            //     throw new Error('Exceed the maximal count of style tags in IE')
            // }

            style.styleSheet.cssText += styleText;
        }
        // W3C
        else {
            style.appendChild(this.create('#text', styleText));
        }
    };
});