/*!
 * 核心 dom 修改器
 * @author ydr.me
 * 2014-09-16 17:02
 */


define(function (require, exports, module) {
    /**
     * @module core/dom/modification
     * @requires utils/dato
     * @requires core/dom/selector
     * @requires core/dom/attribute
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var domSelector = require('./selector.js');
    var attribute = require('./attribute.js');
    var regSpace = /\s+/g;
    var regDir = />/g;
    //var regComments = /\/\*+([\s\S]*?)\*+\//;
    var head = domSelector.query('head')[0] || document.documentElement;
    var proto = DOMParser.prototype;
    var nativeParse = proto.parseFromString;


    // fallback
    proto.parseFromString2 = function (markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            var doc = document.implementation.createHTMLDocument('');

            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            } else {
                doc.body.innerHTML = markup;
            }

            return doc;
        } else {
            return nativeParse.apply(this, arguments);
        }
    };


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
        var dom = parser.parseFromString(htmlString, 'text/html');

        if (!dom) {
            dom = parser.parseFromString2(htmlString, 'text/html');
        }

        return dom.body.childNodes;
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
                node = document.createTextNode(typeis.undefined(attributes) ? '' : String(attributes));
                break;

            case '#comment':
                node = document.createComment(typeis.undefined(attributes) ? '' : String(attributes));
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
     * @param {Object|String} source 源
     * @param {Object} target 目标
     * @param {String} [position="beforeend"] 插入位置，分别为：beforebegin、afterbegin、beforeend、afterend
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
    exports.insert = function (source, target, position) {
        position = position || 'beforeend';

        if (typeis.string(source)) {
            target.insertAdjacentHTML(position, source);
        } else if (source && source.nodeType) {
            _insertElement(source, target, position);
        }
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


    ///**
    // * 清空元素
    // * @param $ele
    // */
    //exports.empty = function ($ele) {
    //    while($ele.firstChild){
    //        exports.remove($ele.firstChild);
    //    }
    //};


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

        var target = exports.parse(htmlstring);
        var wrap;

        if (target.length && target[0].nodeType === 1) {
            // 这里必须复制对象
            // 因为后面的 DOM 修改会影响这里，因为 target 是一个对象引用
            wrap = dato.extend([], target);
            this.insert(wrap[0], source, 'beforebegin');
            target = wrap[0];

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
                return false;
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
     * @param {String|HTMLElement|Node} [selector=null] 选择器
     * @param {Boolean} [isAppend=false] 是否为追加模式
     * @returns {HTMLStyleElement}
     *
     * @example
     * modification.importStyle('body{padding: 10px;}');
     */
    exports.importStyle = function (styleText, selector, isAppend) {
        var args = arguments;

        if (typeis.boolean(args[1])) {
            isAppend = args[1];
            selector = null;
        }

        var $style = domSelector.query(selector)[0];

        if (!$style) {
            $style = exports.create('style');
            exports.insert($style, head, 'beforeend');
        }

        styleText = String(styleText);

        // IE
        if ($style.styleSheet) {
            // 此 BUG 仅影响 IE8（含） 以下浏览器
            // http://support.microsoft.com/kb/262161
            // if (document.getElementsByTagName('style').length > 31) {
            //     throw new Error('Exceed the maximal count of style tags in IE')
            // }

            if (isAppend) {
                $style.styleSheet.cssText += styleText;
            } else {
                $style.styleSheet.cssText = styleText;
            }
        }
        // W3C
        else {
            if (isAppend) {
                $style.innerHTML += styleText;
            } else {
                $style.innerHTML = styleText;
            }
        }

        return $style;
    };


    /**
     * 插入 Element
     * @param source
     * @param target
     * @param position
     */
    function _insertElement(source, target, position) {
        switch (position) {
            // 源插入到目标外部之前
            case 'beforebegin':
                if (target && source && target.parentNode) {
                    target.parentNode.insertBefore(source, target);
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
                }

                break;

            // 源插入到目标内部最后
            case 'beforeend':
                if (target && source) {
                    target.appendChild(source);
                }

                break;

            // 源插入到目标外部之后
            case 'afterend':
                if (target && source && target.parentNode) {
                    if (target.nextSibling) {
                        target.parentNode.insertBefore(source, target.nextSibling);
                    } else {
                        target.parentNode.appendChild(source);
                    }
                }

                break;
        }
    }
});