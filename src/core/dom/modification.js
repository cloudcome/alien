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
    var regHump = /[A-Z]/g;

    module.exports = {
        /**
         * 解析字符串为节点，兼容IE10+
         * @link https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
         * @param {String} htmlString
         * @returns {NodeList/HTMLElement}
         */
        parse: function parse(htmlString) {
            var parser = new DOMParser();
            return parser.parseFromString(htmlString, 'text/html').body.childNodes;
        },
        /**
         * 创建节点
         * @param {String}       nodeName       节点名称，可以为#text、#comment、tagName
         * @param {String/Object}[attributes]   节点属性
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
         * 在指定容器内后加节点
         * @param {HTMLElement|Node} source 操作节点
         * @param {HTMLElement|Node} target   目标节点
         * @returns {HTMLElement|Node} 目标节点
         */
        append: function append(source, target) {
            if (target && source) {
                target.appendChild(source);
                return target;
            }

            return null;
        },
        appendTo: function (source, target) {
            this.append(source, target);
            return source;
        },
        /**
         * 在指定容器内前加节点
         * @param {HTMLElement|Node} source 操作节点
         * @param {HTMLElement|Node} target   目标节点
         * @returns {HTMLElement|Node} 目标节点
         */
        prepend: function prepend(source, target) {
            if (target && source && target.firstChild) {
                target.insertBefore(source, target.firstChild);
                return target;
            } else {
                return this.append(source, target);
            }
        },
        prependTo: function (source, target) {
            this.prepend(source, target);
            return source;
        },
        /**
         * 在指定容器外前加节点
         * @param {HTMLElement|Node} source 操作节点
         * @param {HTMLElement|Node} target   目标节点
         * @returns {HTMLElement|Node} 目标节点
         */
        before: function before(source, target) {
            if (target && source && target.parentNode) {
                target.parentNode.insertBefore(source, target);
                return target;
            }

            return null;
        },
        insertBefore: function (source, target) {
            this.before(source, target);
            return source;
        },
        /**
         * 在指定容器外后加节点
         * @param {HTMLElement|Node} source 操作节点
         * @param {HTMLElement|Node} target   目标节点
         * @returns {HTMLElement|Node} 目标节点
         */
        after: function after(source, target) {
            if (target && source && target.parentNode) {
                target.nextSibling ?
                    target.parentNode.insertBefore(source, target.nextSibling) :
                    this.append(source, target.parentNode);
                return target;
            }

            return null;
        },
        insertAfter: function (source, target) {
            this.after(source, target);
            return source;
        },
        /**
         * 元素外层追加一层
         * @param {HTMLElement|Node} source 元素
         * @param {String} htmlstring html字符串
         */
        wrap: function wrap(source, htmlstring) {
            var target = this.parse(htmlstring);

            if (target.length && target[0].nodeType === 1) {
                target = this.insertBefore(target[0], source);
                return this.append(source, target);
            }

            return null;
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