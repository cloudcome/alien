/*!
 * 文本域选区
 * @author ydr.me
 * @create 2014-10-31 17:26
 */


define(function (require, exports) {
    /**
     * @module utils/selection
     * @require utils/dato
     * @require utils/number
     * @require core/dom/selector
     * @require core/dom/attribute
     * @require core/dom/modification
     */
    'use strict';

    var dato = require('./dato.js');
    var number = require('./number.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var $div = modification.create('div', {
        style: {
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
            var pos0 = number.parseInt(pos[0], 0);
            $ele.setSelectionRange(pos0, number.parseInt(pos[1], pos0));
        }
    };


    /**
     * 获取光标所在的坐标，相对于元素自身
     * @param $ele {Object} 元素
     * @returns {{left: number, top: number}}
     */
    exports.getOffset = function ($ele) {
        var pos = {left: 0, top: 0};

        if (!$ele) {
            return pos;
        }

        // input/textarea
        if ($ele.setSelectionRange) {
            var style = attribute.css($ele, typographyStyles);
            var pos0 = exports.getPos($ele)[0];
            var val = $ele.value;

            val = val.slice(0, pos0) + '<i style="display:inline;font-size:0;"></i>' + val.slice(pos0);
            $div.innerHTML = val;
            attribute.css($div, style);

            var $i = selector.query('i', $div)[0];

            pos.left = $i.offsetLeft;
            pos.top = $i.offsetTop;
        }
        // div[contenteditable]
        else {
            var nodeLeft = attribute.left($ele) - attribute.scrollLeft(window);
            var nodeTop = attribute.top($ele) - attribute.scrollTop(window);
            var selection = document.getSelection();

            if (selection.type === 'Caret') {
                var range = selection.getRangeAt(0);
                var rects = range.getClientRects();
                var rect;

                if (rects.length) {
                    // 相对于窗口
                    rect = rects[0];
                    pos.left = rect.left - nodeLeft;
                    pos.top = rect.top - nodeTop;
                } else if (range.endContainer && range.endContainer.getBoundingClientRect) {
                    rect = range.endContainer.getBoundingClientRect();
                    pos.left = rect.left - nodeLeft;
                    pos.top = rect.top - nodeTop;
                }
            }
        }

        return pos;
    };

    modification.insert($div, document.body);
});