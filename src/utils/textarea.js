/**
 * textarea utils
 * @author ydr.me
 * @create 2015-12-23 16:40
 */


define(function (require, exports, module) {
    /**
     * @module utils/textarea
     * @reuqires utils/allocation
     * @reuqires utils/typeis
     * @reuqires utils/controller
     */

    'use strict';

    var allocation = require('./allocation.js');
    var typeis = require('./typeis.js');
    var controller = require('./controller.js');

    var doc = document;
    var $textarea = doc.createElement('textarea');
    var supportSetSelectionRange = 'setSelectionRange' in $textarea;
    $textarea = null;


    /**
     * 获取当前文本输入框选区
     * @link https://github.com/kof/field-selection/blob/master/lib/field-selection.js#L45
     * @param node {Object} 元素
     * @returns {[Number, Number]}
     */
    exports.getSelection = function (node) {
        if (supportSetSelectionRange) {
            return [node.selectionStart, node.selectionEnd];
        }

        var range = doc.selection.createRange();

        if (!range) {
            return [0, 0];
        }

        var textRange = node.createTextRange();
        var dTextRange = textRange.duplicate();

        textRange.moveToBookmark(range.getBookmark());
        dTextRange.setEndPoint('EndToStart', textRange);

        var start = dTextRange.text.length;
        var end = dTextRange.text.length + range.text.length;

        return [start, end];
    };


    /**
     * 设置选区
     * @param node {Object} 输入元素
     * @param start {Number} 起始位置
     * @param [end=start] {Number} 终点位置
     */
    exports.setSelection = function (node, start, end) {
        end = end || start;

        controller.nextFrame(function () {
            if (supportSetSelectionRange) {
                node.setSelectionRange(start, end);
                return;
            }

            node.focus();
            var textRange = node.createTextRange();
            textRange.collapse(true);
            textRange.moveStart('character', start);
            textRange.moveEnd('character', end - start);
            textRange.select();
        });
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

        if (select) {
            exports.setSelection(node, position, position + text.length);
        }
    };
});