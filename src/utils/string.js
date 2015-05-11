/*!
 * 字符串相关
 * @author ydr.me
 * @create 2015-05-11 10:28
 */


define(function (require, exports, module) {
    /**
     * @module utils/string
     * @requires utils/dato
     * @requires utils/typeis
     */

    'use strict';

    var dato = require('./dato.js');
    var typeis = require('./typeis.js');
    var escapeHTMLMap = {
        '&amp;': /&/g,
        '&lt;': /</g,
        '&gt;': />/g,
        '&quot;': /"/g,
        '&apos;': /'/g,
        '&#x2f;': /\//g
    };
    var HTML_CODE_MATCH = /&#(x)?([\w\d]{0,5});/i;
    var unescapeHTMLMap = {
        '&': /&amp;/g,
        '<': /&lt;/g,
        '>': /&gt;/g,
        '"': /&quot;/g,
        '\'': /&apos;/g,
        '/': /&#x2f;/g
    };
    var assignVarible = /\$\{([^{}]*?)}/g;


    /**
     * 转换 HTML 字符串为实体符
     * @param str {String} html 字符串
     * @returns {String}
     */
    exports.escapeHTML = function (str) {
        dato.each(escapeHTMLMap, function (src, reg) {
            str = str.replace(reg, src);
        });

        return str;
    };


    /**
     * 转换实体符为 HTML 字符串
     * @param str {String} entry 实体符
     * @returns {String}
     */
    exports.unescapeHTML = function (str) {
        // 转换实体数字为实体字母
        str.replace(HTML_CODE_MATCH, function (full, hex, code) {
            return String.fromCharCode(dato.parseInt(code, hex ? 16 : 10));
        });

        dato.each(unescapeHTMLMap, function (src, reg) {
            str = str.replace(reg, src);
        });

        return str;
    };


    /**
     * 分配字符串，参考 es6
     * @param str
     * @example
     * string.assign('Hello ${name}, how are you ${time}?', {
     *     name: 'Bob',
     *     time: 'today'
     * });
     * // => "Hello Bob, how are you today?"
     *
     * string.assign('Hello ${1}, how are you ${2}?', 'Bob', 'today');
     * // => "Hello Bob, how are you today?"
     */
    exports.assign = function (str/*arguments*/) {
        var args = arguments;
        var data = {};

        // {}
        if (typeis.object(args[1])) {
            data = args[1];
        }
        // 1, 2...
        else {
            dato.each([].slice.call(args, 1), function (index, val) {
                data[index + 1] = val;
            });
        }

        return str.replace(assignVarible, function ($0, $1) {
            return String(data[$1]);
        });
    };



    //exports
});










