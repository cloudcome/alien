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
    var dato = require('../../utils/dato.js');
    var alienKey = '-alien-core-dom-see-';
    var win = window;
    var doc = win.document;
    var html = doc.documentElement;
    var $body = doc.body;
    var tagDisplayMap = {};
    var getCSSDisplay = function ($ele) {
        return win.getComputedStyle($ele, null).getPropertyValue('display');
    };
    var getStyleDisplay = function ($ele) {
        return $ele.style.display;
    };
    var setStyleDisplay = function ($ele, display) {
        $ele.style.display = display;
    };
    /**
     * 获取元素的默认 display
     * @param tagname
     * @returns {*}
     */
    var getDefaultDisplay = function (tagname) {
        tagname = tagname.toLowerCase();

        if (tagDisplayMap[tagname]) {
            return tagDisplayMap[tagname];
        }

        var $ele = doc.createElement(tagname);

        $body.appendChild($ele);

        var ret = tagDisplayMap[tagname] = getCSSDisplay($ele);

        $body.removeChild($ele);

        return ret;
    };


    /**
     * 获取元素的默认 display
     * @param $ele {Element} 元素
     * @returns {String}
     */
    exports.getDisplay = function ($ele) {
        return getDefaultDisplay($ele.tagName);
    };


    /**
     * 获得某元素的显示情况，可能值为 true、false
     * @param {HTMLElement|Node} $ele 元素
     * @param {Boolean} [isVisible] 是否可见
     * @returns {Boolean|Array} 获取值为 true、false，设置时返回改变过的 dom 数组
     */
    exports.visible = function ($ele, isVisible) {
        var temp;
        var ret = [];
        var none = 'none';
        var block = 'block';
        var visible = 'visible';
        var hidden = 'hidden';

        if ($ele === win || $ele === doc || $ele === html || !$ele) {
            return true;
        }

        // get
        if (arguments.length === 1) {
            if (
                // 非 element
            !$ele || $ele.nodeType !== 1 ||
                // 本身就是隐藏的
            getCSSDisplay($ele) === none
            ) {
                return false;
            }

            // 逐层向父级遍历，如果有 none，则为 false
            while ((temp = selector.parent($ele)) && temp.length && temp[0] !== document) {
                $ele = temp[0];

                if (getCSSDisplay($ele) === none) {
                    return false;
                }
            }

            return true;
        }

        // set
        var nowVisibility = exports.visible($ele);

        if (nowVisibility === isVisible || !$ele || $ele.nodeType !== 1) {
            return ret;
        }

        // 如果当前可见 => 设为不可见
        if (nowVisibility === true) {
            setStyleDisplay($ele, none);
        } else {
            while ($ele !== document && !exports.visible($ele)) {
                ret.push({
                    ele: $ele,
                    display: getStyleDisplay($ele)
                });

                setStyleDisplay($ele, getDefaultDisplay($ele.tagName));

                if ((temp = selector.parent($ele)) && temp.length) {
                    $ele = temp[0];
                }
            }
        }

        return ret;
    };


    /**
     * 设置元素可见并做完事情，然后回退
     * 通常用于隐藏获取元素的尺寸等
     * @param $ele {Element} 元素
     * @param doWhat {Function} 回调
     */
    exports.swap = function ($ele, doWhat) {
        var list = exports.visible($ele, true);
        var ret = doWhat($ele);

        dato.each(list, function (index, item) {
            setStyleDisplay(item.ele, item.display);
        });

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

        if (!exports.visible($ele)) {
            return false;
        }

        var bcr = $ele.getBoundingClientRect();
        offset = number.parseFloat(offset, 0);

        return bcr.top - offset < Math.max(window.innerHeight, document.documentElement.clientHeight);
    };
});