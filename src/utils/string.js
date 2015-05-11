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
    var win = window;
    var escapeHTMLMap = {
        '&amp;': /&/g,
        '&lt;': /</g,
        '&gt;': />/g,
        '&quot;': /"/g,
        '&apos;': /'/g,
        '&#x2f;': /\//g
    };
    var REG_HTML_CODE = /&#(x)?([\w\d]{0,5});/i;
    var unescapeHTMLMap = {
        '&': /&amp;/g,
        '<': /&lt;/g,
        '>': /&gt;/g,
        '"': /&quot;/g,
        '\'': /&apos;/g,
        '/': /&#x2f;/g
    };
    var REG_ASSIGN_VARIBLE = /\$\{([^{}]*?)}/g;
    var REG_SEPARATOR = /[-_ ]([a-z])/g;
    var REG_HUMP = /[A-Z]/g;


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
        str.replace(REG_HTML_CODE, function (full, hex, code) {
            return String.fromCharCode(dato.parseInt(code, hex ? 16 : 10));
        });

        dato.each(unescapeHTMLMap, function (src, reg) {
            str = str.replace(reg, src);
        });

        return str;
    };


    /**
     * 分配字符串，参考 es6
     * @param str {String} 字符串模板
     * @returns {String}
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

        return str.replace(REG_ASSIGN_VARIBLE, function ($0, $1) {
            return String(data[$1]);
        });
    };


    /**
     * 转换分隔符字符串为驼峰形式
     * @param str {String} 分隔符字符串
     * @param [upperCaseFirstChar=false] {Boolean} 是否大写第一个字母
     * @returns {String}
     *
     * @example
     * string.humprize('moz-border-radius');
     * // => "mozBorderRadius"
     */
    exports.humprize = function (str, upperCaseFirstChar) {
        if (upperCaseFirstChar) {
            str = str[0].toUpperCase() + str.substr(1);
        }

        return str.replace(REG_SEPARATOR, function ($0, $1) {
            return $1.toUpperCase();
        });
    };


    /**
     * 转换驼峰字符串为分隔符字符串
     * @param str {String} 驼峰字符串
     * @param [separator="-"] {String} 分隔符
     * @returns {string}
     * @example
     * string.separatorize('mozBorderRadius');
     * // => "moz-border-radius"
     */
    exports.separatorize = function (str, separator) {
        separator = separator || '-';
        str = str[0].toLowerCase() + str.substr(1);

        return str.replace(REG_HUMP, function ($0) {
            return separator + $0.toLowerCase();
        });
    };


    /**
     * base64 编码
     * @param str {String} 字符串
     * @returns {string}
     */
    exports.base64 = function (str) {
        if (typeis.undefined(win.Buffer)) {
            return btoa(encodeURIComponent(str));
        } else {
            return new win.Buffer(str, 'utf8').toString('base64');
        }
    };
});










