/*!
 * 文本域选区
 * @author ydr.me
 * @create 2014-10-31 17:26
 */


define(function (require, exports) {
    /**
     * @module util/selection
     */
    'use strict';

    var doc = document;
    var abc = require('./abc.js');


    /**
     * 获取选区
     * @param  {Object} $ele  输入框对象
     * @return {Array} [开始位置, 结束位置]
     */
    exports.gtSelection = function ($ele) {
        var pos = [];
        var ae;

        try {
            $ele.focus();
        } catch (err) {
            // ignore
        }

        if (doc.activeElement && doc.activeElement === $ele) {
            ae = doc.activeElement;
            pos.push(ae.selectionStart, ae.selectionEnd);
            return pos;
        }

        return [0, 0];
    };


    /**
     * 设置选区
     * @param $ele {HTMLTextAreaElement} 文本域
     * @param start {Number} 开始位置
     * @param end {Number} 结束位置
     */
    exports.setSelection = function ($ele, start, end) {
        if (doc.activeElement && doc.activeElement === $ele) {
            $ele.setSelectionRange(start, end);

            try {
                $ele.focus();
            } catch (err) {
                // ignore
            }
        }
    };
});