/**
 * textarea utils
 * @author ydr.me
 * @create 2015-12-23 16:40
 */


define(function (require, exports, module) {
    /**
     * @module utils/textarea
     * @reuqires core/dom/modification
     * @reuqires utils/allocation
     * @reuqires utils/typeis
     * @reuqires utils/controller
     * @reuqires utils/number
     */

    'use strict';

    var modification = require('../core/dom/modification.js');
    var allocation = require('./allocation.js');
    var typeis = require('./typeis.js');
    var controller = require('./controller.js');
    var number = require('./number.js');

    var doc = document;
    var $textarea = modification.create('textarea');
    var supportSetSelectionRange = 'setSelectionRange' in $textarea;
    $textarea = null;
    // @link https://github.com/Codecademy/textarea-helper/blob/master/textarea-helper.js
    var typographyStyles = [
        // Box Styles.
        'box-sizing', 'height', 'width', 'padding-bottom',
        'padding-left', 'padding-right', 'padding-top',

        // Font stuff.
        'font-family', 'font-size', 'font-style',
        'font-variant', 'font-weight',

        // Spacing etc.
        'word-spacing', 'letter-spacing', 'line-height',
        'text-decoration', 'text-indent', 'text-transform',

        // The direction.
        'direction'
    ];
    var mirrorEle = modification.create('div', {
        tabindex: -1,
        style: {
            position: 'absolute',
            top: '-9999em',
            left: '-9999em'
        }
    });
    modification.insert(mirrorEle, doc.body);


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
     * @returns {{start: Number, end: Number, value: String}}
     */
    exports.setSelection = function (node, start, end) {
        var args = allocation.args(arguments);

        if (args.length === 1) {
            end = start;
        }

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

        return {
            start: start,
            end: end,
            value: node.value
        };
    };


    /**
     * 插入文本
     * @param node {Object} textarea 元素
     * @param text {String} 文本
     * @param [insertPosition] {Array|Boolean} 插入前的位置，默认为当前光标所在位置，为 true 表示当前位置
     * @param [focusRelativePostion] {Array|Boolean} 插入后光标的位置，默认为当前光标所在位置
     * true：选中插入的文本
     * false：定位到文本末尾
     * @returns {{start: Number, end: Number, value: String}}
     */
    exports.insert = function (node, text, insertPosition, focusRelativePostion) {
        var args = allocation.args(arguments);
        var selection = exports.getSelection(node);
        text = String(text);
        var start = selection[0];
        var end = selection[1];
        var value = node.value;
        var textLength = text.length;

        switch (args.length) {
            // insert(node, text);
            case 2:
                insertPosition = [start, end];
                focusRelativePostion = [0, textLength];
                break;
            case 3:
                // insert(node, text, true);
                if (args[2] === true) {
                    insertPosition = [start, end];
                }
                // insert(node, text, false);
                else if (args[2] === false) {
                    insertPosition = [start + textLength, start + textLength];
                }

                focusRelativePostion = [0, textLength];
                break;
            //
            case 4:
                // insert(node, text, true);
                if (args[2] === true) {
                    insertPosition = [start, end];
                }
                // insert(node, text, false);
                else if (args[2] === false) {
                    insertPosition = [start + textLength, start + textLength];
                }

                // insert(node, text, what, true);
                if (args[3] === true) {
                    focusRelativePostion = [0, textLength];
                }
                // insert(node, text, what, false);
                else if (args[3] === false) {
                    focusRelativePostion = [textLength, textLength];
                }
                break;
        }

        insertPosition[1] = insertPosition[1] || insertPosition[0];
        focusRelativePostion[1] = focusRelativePostion[1] || focusRelativePostion[0];
        var left = value.slice(0, insertPosition[0]);
        var right = value.slice(insertPosition[1]);
        var focusStart = insertPosition[0] + focusRelativePostion[0];
        var focusEnd = insertPosition[0] + focusRelativePostion[1];

        node.value = value = left + text + right;
        exports.setSelection(node, focusStart, focusEnd);

        return {
            start: focusStart,
            end: focusEnd,
            value: value
        };
    };


    exports.getSelectionRect = function (node) {
        var sel = exports.getSelection(node);
        var start = sel[0];
        var end = sel[1];
        // If available (thus IE), use the createTextRange method
        if (typeis.Function(node.createTextRange)) {
            var range = node.createTextRange();
            range.collapse(true);
            range.moveStart('character', start);
            range.moveEnd('character', end - start);
            return range.getBoundingClientRect();
        }
    };
});