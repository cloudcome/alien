/*!
 * 编辑器选区相关操作
 * @author ydr.me
 * @create 2014-11-06 11:17
 */


define(function (require, exports, module) {
    /**
     * @module ui/editor
     * @requires util/selection
     * @requires util/dato
     */
    'use strict';

    var selection = require('../../util/selection.js');
    var dato = require('../../util/dato.js');
    var REG_LINEEND = /\n/g;
    var REG_START_SPACE = /^\s+/;
    var udf;

    exports.getPos = selection.getPos;
    exports.setPos = selection.setPos;

    /**
     * 在当前光标处插入字符串
     * @param $ele {HTMLTextAreaElement} 文本域
     * @param string {String} 插入字符串
     */
    exports.insert = function ($ele, string) {
        var pos = selection.getPos($ele);
        var start = pos[0];
        var end = pos[1];
        var old = $ele.value;
        var length = start + string.length;

        $ele.value = old.slice(0, start) + string + old.slice(end);
        selection.setPos($ele, length);
    };


    /**
     * 向前删
     * @param $ele {HTMLTextAreaElement} 文本域
     * @param length {Number} 删除长度，当有选区时删除选区
     */
    exports.backspace = function ($ele, length) {
        var pos = selection.getPos($ele);
        var start = pos[0];
        var end = pos[1];
        var old = $ele.value;
        var sliceStart;
        var neo = '';
        var setPos = 0;

        // 单光标
        if (start === end) {
            sliceStart = start - length;
            sliceStart = sliceStart < 0 ? 0 : sliceStart;
            neo = old.slice(0, sliceStart) + old.slice(end);
            setPos = sliceStart;
        }
        // 有选区
        else {
            neo = old.slice(0, start) + old.slice(end);
            setPos = start;
        }

        $ele.value = neo;
        selection.setPos($ele, setPos);
    };


    exports.delete = function ($ele, length) {
        var pos = selection.getPos($ele);
        var start = pos[0];
        var end = pos[1];
        var old = $ele.value;
        var max = old.length - length;
        var sliceEnd;
        var neo = '';
        var setPos = 0;

        // 单光标
        if (start === end) {
            sliceEnd = end + length;
            sliceEnd = sliceEnd > max ? max : sliceEnd;
            neo = old.slice(0, start) + old.slice(sliceEnd);
            setPos = start;
        }
        // 有选区
        else {
            neo = old.slice(0, start) + old.slice(end);
            setPos = start;
        }

        $ele.value = neo;
        selection.setPos($ele, setPos);
    };


    exports.shiftTab = function ($ele, length) {
        var value = $ele.value;
        var startOfLinePos = _getStartOfLinePos(value);
        var selectionStart = selection.getPos($ele)[0];
        var lineStart = -1;
        var findIndex = -1;
        var lineString = '';
        // 开始空白长度
        var spaceLength = 0;
        var newValue = '';

        dato.each(startOfLinePos, function (i, pos) {
            if (selectionStart >= pos && (startOfLinePos[i + 1] === udf || selectionStart < startOfLinePos[i + 1])) {
                lineStart = pos;
                findIndex = i;
                return false;
            }
        });

        if (lineStart > -1) {
            lineString = value.slice(startOfLinePos[findIndex], startOfLinePos[findIndex + 1] ? startOfLinePos[findIndex + 1] - 1 : udf);
            spaceLength = (lineString.match(REG_START_SPACE) || [''])[0].length;

            // 空白足够
            if (spaceLength >= length) {
                newValue = value.slice(0, startOfLinePos[findIndex]) + value.slice(startOfLinePos[findIndex] + length);
                $ele.value = newValue;
                selection.setPos($ele, selectionStart - length);
            }
        }
    };


    /**
     * 构造重复字符串
     * @param string {String} 原始字符串
     * @param length {Number} 重复次数
     * @returns {string}
     */
    exports.repeatString = function (string, length) {
        var ret = '';

        while (length--) {
            ret += string;
        }

        return ret;
    };


    /**
     * 聚焦文本末尾
     * @param $ele
     */
    exports.focusEnd = function ($ele) {
        selection.setPos($ele, $ele.value.length);
    };


    /**
     * 获得每行行首位置
     * @param value
     * @returns {number[]}
     * @private
     */
    function _getStartOfLinePos(value) {
        var startOfLinePos = [0];

        while (REG_LINEEND.exec(value)) {
            startOfLinePos.push(REG_LINEEND.lastIndex);
        }

        return startOfLinePos;
    }
});