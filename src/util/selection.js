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
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var $div = modification.create('div', {
        style:{
            position: 'absolute',
            top: '-9999em',
            left: '-9999em'
        }
    });
    var typographyStyles = [
        'font',
        'letterSpacing',
        'textTransform',
        'wordSpacing',
        'textIndent',
        'whiteSpace',
        'lineHeight',
        'padding',
        'width',
        'height',
        'border'
    ];

    
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
            var pos0 = dato.parseInt(pos[0], 0);
            $ele.setSelectionRange(pos0, dato.parseInt(pos[1], pos0));
        }
    };


    /**
     * 获取光标所在的坐标
     * @param $ele
     */
    exports.getOffset = function ($ele) {
        if ($ele && $ele.setSelectionRange) {
            var style = attribute.css($ele, typographyStyles);
            var pos0 = exports.getPos($ele)[0];
            var val = $ele.value;

            val = val.slice(0, pos0) + '<i style="display:inline;font-size:0;"></i>' + val.slice(pos0);
            $div.innerHTML = val;
            attribute.css($div, style);
            
            var $i = selector.query('i', $div)[0];
            
            return [$i.offsetLeft, $i.offsetTop];
        }

        return [0, 0];
    };

    modification.insert($div, document.body);
});