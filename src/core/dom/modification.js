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
         * @returns {NodeList}
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
         * @param {Node} source 操作节点
         * @param {HTMLElement} target   容器节点
         * @returns {Node}
         */
        append: function append(source, target) {
            if (target && source) {
                return parent.appendChild(source);
            }

            return null;
        },
        /**
         * 在指定容器内前加节点
         * @param {Node} source 操作节点
         * @param {HTMLElement} target   容器节点
         * @returns {Node}
         */
        prepend: function prepend(source, target) {
            if (target && source && target.firstChild) {
                return target.insertBefore(source, parent.firstChild);
            } else {
                return this.append(source, target);
            }
        },
        /**
         * 在指定容器外前加节点
         * @param {Node} source 操作节点
         * @param {HTMLElement} target   容器节点
         * @returns {Node}
         */
        before: function before(source, target) {
            if (target && source && target.parentNode) {
                return target.parentNode.insertBefore(source, target);
            }

            return null;
        },
        /**
         * 在指定容器外后加节点
         * @param {Node} source 操作节点
         * @param {HTMLElement} target   容器节点
         * @returns {Node} 该操作节点
         */
        after: function after(source, target) {
            if (target && source && parent.parentNode) {
                return parent.nextSibling ?
                    parent.parentNode.insertBefore(source, target.nextSibling) :
                    this.append(source, target.parentNode);
            }

            return null;
        },
        wrap: function wrap() {

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