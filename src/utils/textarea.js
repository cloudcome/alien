/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-23 16:40
 */


define(function (require, exports, module) {
    /**
     * @module parent/textarea
     */

    'use strict';

    var allocation = require('./allocation.js');
    var typeis = require('./typeis.js');


    var $textarea = document.createElement('textarea');


    /**
     * 设置选区
     * @link https://github.com/bh-lay/Selection/blob/master/asset/selection.js
     * @type {Function}
     */
    var setSelection = $textarea.setSelectionRange ? function (node, start, len) {
        setTimeout(function () {
            node.focus();
            node.setSelectionRange(start, start + len);
        });
    } : function (node, start, len) {
        node.focus();
        var strLen = node.value.length;
        var rng = node.createTextRange();
        rng.moveStart('character', start);
        rng.moveEnd('character', start + len - strLen);
        rng.select();
    };


    /**
     * 获取
     */
    exports.getSelection = function (node) {
        if ($textarea.selectionStart) {
            return [node.selectionStart, node.selectionEnd];
        }


    };


    /**
     * 插入文本
     * @param node {Object} textarea 元素
     * @param text {String} 文本
     * @param [position=0] {Number} 位置
     * @param [select=false] {Boolean} 是否选中刚插入的文本
     */
    exports.insert = function (node, text, position, select) {
        var args = allocation.args(arguments);

        if (args.length === 3 && typeis.Boolean(args[2])) {
            select = args[2];
            position = 0;
        }

        position = position || 0;
        text = String(text);

        var value = node.value;
        var left = value.slice(0, position);
        var right = value.slice(position);

        node.value = left + text + right;
    };
});