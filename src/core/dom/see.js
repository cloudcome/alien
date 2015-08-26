/*!
 * dom 可视
 * @author ydr.me
 * @create 2015-01-21 14:58
 */


define(function (require, exports, module) {
    /**
     * @module core/dom/see
     * @requires core/dom/selector
     */
    'use strict';

    var selector = require('./selector.js');
    var number = require('../../utils/number.js');
    var hiddenTagList = 'script link head meta style'.split(' ');
    var alienKey = '-alien-core-dom-see-';
    var win = window;
    var doc = win.document;
    var html = doc.documentElement;


    /**
     * 获得某元素的显示情况，可能值为`visible`或`hidden`
     * @param {HTMLElement|Node} $ele 元素
     * @param {String} [changeVisibility] 设置状态值，`visible`或者`hidden`
     * @returns {String|Array} 获取值为`visible`或`hidden`，设置时返回改变过的 dom 数组
     */
    exports.visibility = function ($ele, changeVisibility) {
        var nowVisibility;
        var temp;
        var ret = [];
        var key = 'display';
        var none = 'none';
        var block = 'block';
        var visible = 'visible';
        var hidden = 'hidden';

        if ($ele === win || $ele === doc || $ele === html || !$ele) {
            return visible;
        }

        $ele[alienKey + key] = _getDisplay($ele);

        // get
        if (!changeVisibility) {
            // 非 element
            if (!$ele || $ele.nodeType !== 1) {
                return hidden;
            }

            // 隐藏 element
            if (hiddenTagList.indexOf($ele.tagName.toLowerCase()) > -1) {
                return hidden;
            }

            // 本身就是隐藏的
            if (_getDisplay($ele) === none) {
                return hidden;
            }

            while ((temp = selector.parent($ele)) && temp.length && temp[0] !== document) {
                $ele = temp[0];

                if (_getDisplay($ele) === none) {
                    return hidden;
                }
            }

            return visible;
        }

        // set
        nowVisibility = exports.visibility($ele);

        if (nowVisibility === changeVisibility || !$ele || $ele.nodeType !== 1) {
            return ret;
        }

        if (nowVisibility === visible) {
            $ele[alienKey + key] = _getDisplay($ele);
            $ele.style.display = none;
        } else {
            while ($ele !== document && exports.visibility($ele) !== changeVisibility) {
                if (_getDisplay($ele) === none) {
                    _setDisplay($ele, $ele[alienKey + key] !== none ? $ele[alienKey + key] : block);
                    ret.push($ele);
                }

                if ((temp = selector.parent($ele)) && temp.length) {
                    $ele = temp[0];
                }
            }
        }

        return ret;
    };


    /**
     * 判断元素是否在当前视口内
     * 1.元素不可见：返回 false
     * 2.元素不在视口内：返回 false
     * @param $ele {HTMLElement|Node|EventTarget}
     * @param [offset=0] {Number}
     * @returns {Boolean}
     */
    exports.isInViewport = function ($ele, offset) {
        if (!$ele || $ele.nodeType !== 1) {
            return false;
        }

        if (exports.visibility($ele) === 'hidden') {
            return false;
        }

        var bcr = $ele.getBoundingClientRect();
        offset = number.parseFloat(offset, 0);

        return bcr.top - offset < Math.max(window.innerHeight, document.documentElement.clientHeight);
    };


    /**
     * 获取元素的样式
     * @param $ele
     * @private
     */
    function _getDisplay($ele) {
        return $ele && $ele.nodeType === 1 ? $ele.style.display : undefined;
    }

    /**
     * 设置元素的样式
     * @param $ele
     * @param val
     * @private
     */
    function _setDisplay($ele, val) {
        $ele.style.display = val;
    }
});