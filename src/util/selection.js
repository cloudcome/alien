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
    var data = require('./data.js');

    /**
     * 获取选区
     * @param  {Object} $ele 元素
     * @return {Object}
     */
    exports.getPos = function ($ele) {
        if($ele.selectionStart){
            return [$ele.selectionStart, $ele.selectionEnd];
        }

        return [0, 0];
    };


    /**
     * 设置选区
     * @param $ele {Object} 元素
     * @param [start] {Number} 开始位置，默认为0
     * @param [end] {Number} 结束位置，默认等于start
     *
     * @
     */
    exports.setPos = function ($ele, start, end) {
        start = data.parseInt(start, 0);
        end = end ? data.parseInt(end, 0): start;

        if ($ele && $ele.setSelectionRange) {
            $ele.setSelectionRange(start, end);
            $ele.focus();
        }
    };
});