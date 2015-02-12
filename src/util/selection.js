/*!
 * 文本域选区
 * @author ydr.me
 * @create 2014-10-31 17:26
 */


define(function (require, exports) {
    /**
     * @module util/selection
     * @require util/dato
     */
    'use strict';

    var dato = require('./dato.js');

    /**
     * 获取选区
     * @param  {Object} $ele 元素
     * @return {Object}
     */
    exports.getPos = function ($ele) {
        if ($ele && $ele.setSelectionRange) {
            return [$ele.selectionStart, $ele.selectionEnd];
        }

        return [0, 0];
    };


    /**
     * 设置选区
     * @param $ele {Object} 元素
     * @param [pos] {Array} 开始位置与结束位置
     *
     * @example
     * selection.setPos($ele, [1]);
     * selection.setPos($ele, [1, 10]);
     */
    exports.setPos = function ($ele, pos) {
        if ($ele && $ele.setSelectionRange) {
            $ele.setSelectionRange(pos[0] || 0, pos[1] || pos[0] || 0);
        }
    };
    
    
    
    exports.getOffset = function ($ele) {
        
    };
});