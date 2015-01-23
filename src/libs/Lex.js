/*!
 * DOM模板引擎词法分析
 * @author ydr.me
 * 2014年11月21日 14:48:22
 */


define(function (require, exports, module) {
    'use strict';

    /**
     * @module libs/Lex
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires util/class
     * @requires util/dato
     */

    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var klass = require('../util/class.js');
    var dato = require('../util/dato.js');
    var Lex = klass.create({
        constructor: function ($ele) {
            var the = this;

            the._$ele = selector.query($ele);

            if (!the._$ele.length) {
                throw new Error('instance require an element');
            }

            the._$ele = the._$ele[0];
            the._init();
        },

        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._parser = [];
            // 进入 if 的次数
            the._IF = 0;
            // 进入 each 的次数
            the._EACH = 0;
            the._scanNodes();
        },


        /**
         * 扫描节点
         * @private
         */
        _scanNodes: function () {
            var the = this;
            var nodes = the._$ele.childNodes;

            dato.each(nodes, function (index, node) {
                var nodeType = node.nodeType;

                if (nodeType === 3) {
                    the._parseText(node);
                } else if (nodeType === 1) {
                    the._parseElement(node);
                }
            });
        },


        /**
         * 解析文本
         * @private
         */
        _parseText: function () {
            var the = this;


        },


        /**
         * 解析元素
         * @private
         */
        _parseElement: function () {

        },


        /**
         * 销毁实例
         */
        destroy: function () {

        }
    });


    module.exports = Lex;
});