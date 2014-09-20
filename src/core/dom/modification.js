/*!
 * dom-modification.js
 * @author ydr.me
 * 2014-09-16 17:02
 */


define(function (require, exports, module) {
    /**
     * @module core/dom/modification
     */
    'use strict';

    var data = require('../../util/data.js');
    var domSelector = require('./selector.js');
    var regHump = /[A-Z]/g;
    var regSpace = /\s+/g;
    var regDir = />/g;

    module.exports = {
        /**
         * 解析字符串为节点，兼容IE10+
         * @link https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
         * @param {String} htmlString
         * @returns {NodeList|HTMLElement}
         */
        parse: function parse(htmlString) {
            var parser = new DOMParser();
            return parser.parseFromString(htmlString, 'text/html').body.childNodes;
        },

        /**
         * 创建节点
         * @param {String}       nodeName       节点名称，可以为#text、#comment、tagName
         * @param {String|Object} [attributes]   节点属性
         * @returns {Node}
         * @examples
         * create('#text', '123');
         * create('#comment', '123');
         * create('div', {id:'id-123'});
         */
        create: function create(nodeName, attributes) {
            var node;

            switch (nodeName) {
                case '#text':
                    return document.createTextNode(attributes);

                case '#comment':
                    return document.createComment(attributes);

                default:
                    node = document.createElement(nodeName);
                    data.each(attributes, function (key, val) {
                        var styles = [];

                        if (typeof val === 'object') {
                            if (key === 'style') {
                                data.each(val, function (k, v) {
                                    styles.push(_toSepString(k) + ':' + v);
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

                    return node;
            }
        },

        /**
         * 将源插入到指定的目标位置，并返回指定的元素
         * @param {HTMLElement|Node} source 源
         * @param {HTMLElement|Node} target 目标
         * @param {String} position 插入位置，分别为：beforebegin、afterbegin、beforeend、afterend
         * @param {Boolean} [isReturnSource] 是否返回源，默认false
         * @returns {HTMLElement|Node|null}
         */
        insert: function insert(source, target, position, isReturnSource) {
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
        },
        /**
         * 元素外层追加一层
         * @param {HTMLElement|Node} source 元素
         * @param {String} htmlstring html字符串
         */
        wrap: function wrap(source, htmlstring) {
            var target = this.parse(htmlstring);

            if (target.length && target[0].nodeType === 1) {
                target = this.insert(target[0], source, 'beforebegin', !0);

                if (target) {
                    while (target.firstElementChild) {
                        target = target.firstElementChild;
                    }

                    return this.insert(source, target, 'beforeend');
                }
            }

            return null;
        },
        /**
         * 移除源的外层元素，匹配选择器
         * @param {HTMLElement|Node} source 源
         * @param {String} selector 选择器
         */
        unwrap: function unwrap(source, selector) {
            var selectors = selector.trim().replace(regDir, '').split(regSpace);
            var the = this;

            // .div1 .p1 .div2
            // => .div2 .p1 .div1
            data.each(selectors.reverse(), function (index, selector) {
                if (domSelector.isMatched(source.parentNode, selector)) {
                    _removeParent(source);
                } else {
                    return !1;
                }
            });

            function _removeParent(element) {
                var target = the.insert(element, element.parentNode, 'beforebegin');

                if (target) {
                    target.remove();
                }
            }
        }
    };

    /**
     * 转换驼峰字符串为短横线分隔符字符串
     * @param {String} humpString 驼峰字符串
     * @returns {String} 短横线分隔符字符串
     * @private
     */
    function _toSepString(humpString) {
        return humpString.replace(regHump, function ($0) {
            return '-' + $0.toLowerCase();
        });
    }
});