/*!
 * 字符串相关
 * @author ydr.me
 * @create 2015-05-11 10:28
 */


define(function (require, exports, module) {
    /**
     * @module utils/string
     * @requires utils/dato
     */

    'use strict';

    var dato = require('./dato.js');
    var allocation = require('./allocation.js');
    var escapeHTMLMap = {
        '&amp;': /&/g,
        '&lt;': /</g,
        '&gt;': />/g,
        '&quot;': /"/g,
        '&apos;': /'/g,
        '&#x2f;': /\//g
    };
    var unescapeHTMLMap = {
        '&': /&amp;/g,
        '<': /&lt;/g,
        '>': /&gt;/g,
        '"': /&quot;/g,
        '\'': /&apos;/g,
        '/': /&#x2f;/g
    };
    var HTML_CODE_MATCH = /&#(x)?([\w\d]{0,5});/i;


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




    exports.assign = function (str/*arguments*/) {
        allocation.args(arguments);


    };
});










