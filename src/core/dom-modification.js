/*!
 * dom-modification.js
 * @author ydr.me
 * 2014-09-16 17:02
 */


define(function (require, exports, module) {
    /**
     * @module parent/dom-modification
     */
    'use strict';

    var dataTraveller = require('../util/data-traveller.js');
    var regHump = /[A-Z]/g;

    module.exports = {
        /**
         * 解析字符串为节点，兼容IE10+
         * @link https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
         * @param {String} htmlString
         * @returns {NodeList}
         */
        parse: function (htmlString) {
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
        create: function (nodeName, attributes) {
            var node;

            switch (nodeName) {
                case '#text':
                    return document.createTextNode(attributes);

                case '#comment':
                    return document.createComment(attributes);

                default:
                    node = document.createElement(nodeName);
                    dataTraveller.each(attributes, function (key, val) {
                        var styles = [];

                        if (typeof val === 'object') {
                            if (key === 'style') {
                                dataTraveller.each(val, function (k, v) {
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
         * @param {Node} children 操作节点
         * @param {HTMLElement} parent   容器节点
         * @returns {Node}
         */
        append: function (children, parent) {
            if (parent && children) {
                return parent.appendChild(children);
            }

            return null;
        },
        /**
         * 在指定容器内前加节点
         * @param {Node} children 操作节点
         * @param {HTMLElement} parent   容器节点
         * @returns {Node}
         */
        prepend: function (children, parent) {
            if (parent && children && parent.firstChild) {
                return parent.insertBefore(children, parent.firstChild);
            } else {
                return this.append(children, parent);
            }
        },
        /**
         * 在指定容器外前加节点
         * @param {Node} children 操作节点
         * @param {HTMLElement} parent   容器节点
         * @returns {Node}
         */
        before: function (children, parent) {
            if (parent && children && parent.parentNode) {
                return parent.parentNode.insertBefore(children, parent);
            }

            return null;
        },
        /**
         * 在指定容器外后加节点
         * @param {Node} children 操作节点
         * @param {HTMLElement} parent   容器节点
         * @returns {Node} 该操作节点
         */
        after: function (children, parent) {
            if (parent && children && parent.parentNode) {
                return parent.nextSibling ?
                    parent.parentNode.insertBefore(children, parent.nextSibling) :
                    this.append(children, parent.parentNode);
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