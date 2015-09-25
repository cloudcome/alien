/*!
 * compatible.js
 * @author ydr.me
 * 2014-09-16 16:20
 */


define(function (require, exports, module) {
    /**
     * @module core/navigator/compatible
     * @requires utils/dato
     * @requires utils/string
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var string = require('../../utils/string.js');
    var html5Prefixs = ['', 'webkit', 'moz', 'ms', 'MS'];
    var css3Prefixs = ['', '-webkit', '-moz', '-ms'];
    var regCss3 = /^-(webkit|moz|ms|o)-/i;
    var p = document.createElement('p');
    var fixCss = {
        'float': 'cssFloat'
    };
    var regOn = /^on/;

    /**
     * 获取有浏览器前缀的方法名称
     * @param {String} standard 标准属性、方法名称
     * @param {Object} parent   标准方法父级
     * @param {Boolean} [isEventType=false]   是否为事件类型
     * @returns {String} 私有属性、方法名称
     *
     * @example
     * compatible.html5('audioContext', window);
     * // => "webkitAudioContext"
     */
    exports.html5 = function (standard, parent, isEventType) {
        var html5Key = null;
        var find = false;

        if (isEventType) {
            standard = standard.replace(regOn, '');
        }

        dato.each(html5Prefixs, function (index, prefix) {
            html5Key = isEventType ?
                (prefix + standard ) :
                (prefix ? prefix + _toUpperCaseFirstLetter(standard) : standard);

            if ((isEventType ? 'on' : '') + html5Key in parent) {
                find = true;
                return false;
            }
        });

        html5Key = find ? html5Key : undefined;

        return html5Key;
    };

    /**
     * 获取有浏览器前缀的CSS3名称
     * @param {String} standardKey 标准的CSS3属性
     * @param {String} [standardVal] 标准的CSS3属性值
     * @returns {String|null} 私有CSS3属性
     *
     * @example
     * compatible.css3('border-start');
     * // => "-webkit-border-start"
     */
    exports.css3 = function (standardKey, standardVal) {
        var cssKey = null;
        var cssVal = null;
        var findKey = false;
        var findVal = null;

        standardKey = string.separatorize(standardKey.trim().replace(regCss3, ''));

        dato.each(css3Prefixs, function (index, prefix) {
            cssKey = prefix ? prefix + '-' + standardKey : standardKey;

            var testCssKey = fixCss[cssKey] ? fixCss[cssKey] : cssKey;
            testCssKey = string.humprize(testCssKey);

            if (testCssKey in p.style) {
                findKey = true;

                if (standardVal) {

                    dato.each(css3Prefixs, function (index, prefix) {
                        cssVal = prefix ? prefix + '-' + standardVal : standardVal;
                        p.style[testCssKey] = cssVal;

                        if (p.style[testCssKey].indexOf(standardVal) > -1) {
                            findVal = cssVal;
                            return false;
                        }
                    });

                    if (findVal) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        });

        if (standardVal) {
            return findVal ? [cssKey, cssVal] : null;
        }

        return findKey ? cssKey : null;
    };

    /**
     * 大写单词中的第一个字母
     * @param {String} word
     * @returns {String}
     * @private
     */
    function _toUpperCaseFirstLetter(word) {
        return word[0].toUpperCase() + word.substr(1);
    }
});