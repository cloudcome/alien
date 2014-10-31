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

    var selector = require('../core/dom/selector.js');

    /**
     * 获取选区
     * @param  {Object} $ele 元素
     * @return {Array} [开始位置, 结束位置]
     */
    exports.get = function ($ele) {
        var focusNode;

        if ($ele.selectionStart) {
            return [$ele.selectionStart, $ele.selectionEnd];
        }else{
            focusNode = window.getSelection().focusNode;

        }
    };


    /**
     * 设置选区
     * @param $ele {Object} 元素
     * @param start {Number} 开始位置
     * @param end {Number} 结束位置
     */
    exports.set = function ($ele, start, end) {
        if ($ele.setSelectionRange) {
            $ele.setSelectionRange(start, end);
        }
    };
});