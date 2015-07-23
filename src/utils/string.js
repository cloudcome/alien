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
    var win = typeof global !== 'undefined' ? global : window;
    var escapeHTMLMap = {
        '&amp;': /&/g,
        '&lt;': /</g,
        '&gt;': />/g,
        '&quot;': /"/g,
        '&apos;': /'/g,
        '&#x2f;': /\//g
    };
    //var REG_HTML_CODE = /&#(x)?([\w\d]{0,5});/ig;
    //var unescapeHTMLMap = {
    //    '&': /&amp;/g,
    //    '<': /&lt;/g,
    //    '>': /&gt;/g,
    //    '"': /&quot;/g,
    //    '\'': /&apos;/g,
    //    '/': /&#x2f;/g
    //};
    var REG_REGESP = /[.*+?^=!:${}()|[\]\/\\-]/g;
    var REG_ASSIGN_VARIBLE = /\$\{([^{}]*?)}/g;
    var REG_SEPARATOR = /[-_ ]([a-z])/g;
    var REG_HUMP = /[A-Z]/g;
    var REG_STAR = /\\\*/g;
    var REG_NOT_UTF16_SINGLE = /[^\x00-\xff]{2}/g;
    var p = document.createElement('p');

    //var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    ///**
    // * base64 编码
    // * @ref https://github.com/davidchambers/Base64.js/blob/master/base64.js
    // */
    //var btoa = typeis.function(win.btoa) ? win.btoa : function (str) {
    //    var block;
    //    var charCode;
    //    var idx;
    //    var map;
    //    var output = '';
    //
    //    for (
    //        // if the next str index does not exist:
    //        //   change the mapping table to "="
    //        //   check if d has no fractional digits
    //        ; str.charAt(idx | 0) || (map = '=', idx % 1);
    //        // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    //          output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    //    ) {
    //        charCode = str.charCodeAt(idx += 3 / 4);
    //        if (charCode > 0xFF) {
    //            throw "'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.";
    //        }
    //        block = block << 8 | charCode;
    //    }
    //    return output;
    //};
    //
    //
    ///**
    // * base64 解码
    // * @ref https://github.com/davidchambers/Base64.js/blob/master/base64.js
    // */
    //var atob = typeis.function(win.atob) ? win.atob : function (input) {
    //    var str = String(input).replace(/=+$/, '');
    //
    //    if (str.length % 4 === 1) {
    //        throw "'atob' failed: The string to be decoded is not correctly encoded.";
    //    }
    //    for (
    //        // initialize result and counters
    //        var bc = 0, bs, buffer, idx = 0, output = '';
    //        // get next character
    //        buffer = str.charAt(idx++);
    //        // character found in table? initialize bit storage and add its ascii value;
    //        buffer !== -1 && (bs = bc % 4 ? bs * 64 + buffer : buffer,
    //            // and if not first of each 4 characters,
    //            // convert the first 8 bits to one ascii character
    //        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    //    ) {
    //        // try to find character in table (0-63, not found => -1)
    //        buffer = chars.indexOf(buffer);
    //    }
    //
    //    return output;
    //};


    /**
     * 转换 HTML 字符串为实体符
     * @param str {String} html 字符串
     * @returns {String}
     */
    exports.escapeHTML = function (str) {
        dato.each(escapeHTMLMap, function (src, reg) {
            str = String(str).replace(reg, src);
        });

        return str;
    };


    /**
     * 转换实体符为 HTML 字符串
     * @param str {String} entry 实体符
     * @returns {String}
     * @link http://frontenddev.org/article/one-line-of-code-that-implement-unescape-html.html
     */
    exports.unescapeHTML = function (str) {
        //// 转换实体数字为实体字母
        //str = String(str).replace(REG_HTML_CODE, function (full, hex, code) {
        //    return String.fromCharCode(parseInt(code, hex ? 16 : 10));
        //});
        //
        //dato.each(unescapeHTMLMap, function (src, reg) {
        //    str = str.replace(reg, src);
        //});
        //
        //return str;

        p.innerHTML = (str + '').replace(/</g, '&lt;');

        return p.textContent || p.innerText || '';
    };


    /**
     * 转换正则字符串为合法正则
     * @param str {String} 正则字符串
     * @returns {string}
     */
    exports.escapeRegExp = function (str) {
        return str.replace(REG_REGESP, '\\$&');
    };


    /**
     * 分配字符串，参考 es6
     * @param str {String} 字符串模板
     * @param filter {Function} 过滤函数
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
    exports.assign = function (str/*arguments*/, filter) {
        var args = [].slice.call(arguments);
        var argL = args.length;
        var data = {};

        if (typeis.function(args[argL - 1])) {
            filter = args.splice(argL - 1, 1)[0];
        } else {
            filter = function (val) {
                return val;
            };
        }

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
            return filter(String(data[$1]));
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
        if (!str.length) {
            return str;
        }

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
        if (!str.length) {
            return str;
        }

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


    /**
     * base64 解码
     * @param str {String} 字符串
     * @returns {string}
     */
    exports.debase64 = function (str) {
        if (typeis.undefined(win.Buffer)) {
            return decodeURIComponent(atob(str));
        } else {
            return new win.Buffer(str, 'base64').toString('utf8');
        }
    };


    /**
     * 填充字符串
     * @param isLeft {Boolean} 是否左边
     * @param str {String} 字符串
     * @param [maxLength] {Number} 最大长度，默认为字符串长度
     * @param [padding=" "] {String} 填充字符串
     * @returns {String}
     */
    var pad = function (isLeft, str, maxLength, padding) {
        var length = str.length;

        padding = padding === undefined ? ' ' : String(padding);
        maxLength = maxLength || length;

        if (maxLength <= length) {
            return str;
        }

        while ((++length) <= maxLength) {
            str = isLeft ? padding + str : str + padding;
        }

        return str;
    };


    /**
     * 左填充
     * @param str {*} 字符串
     * @param [maxLength] {Number} 最大长度，默认为字符串长度
     * @param [padding=" "] {String} 填充字符串
     * @returns {String}
     */
    exports.padLeft = function (str, maxLength, padding) {
        return pad(true, String(str), maxLength, padding);
    };


    /**
     * 右填充
     * @param str {*} 字符串
     * @param [maxLength] {Number} 最大长度，默认为字符串长度
     * @param [padding=" "] {String} 填充字符串
     * @returns {String}
     */
    exports.padRight = function (str, maxLength, padding) {
        return pad(false, String(str), maxLength, padding);
    };


    /**
     * 非点匹配
     * @param str {String} 被匹配字符
     * @param glob {String} 匹配字符
     * @param [ignoreCase=false] {Boolean} 是否忽略大小写
     * @returns {Boolean}
     * @example
     * string.glob('abc.def.com', 'abc.*.com');
     * // => true
     */
    exports.glob = function (str, glob, ignoreCase) {
        var reg = new RegExp(exports.escapeRegExp(glob).replace(REG_STAR, '[^.]+?'), ignoreCase ? 'i' : '');

        return reg.test(str);
    };


    /**
     * 计算字节长度
     * @param string {String} 原始字符串
     * @param [doubleLength=2] {Number} 双字节长度，默认为2
     * @returns {number}
     *
     * @example
     * data.bytes('我123');
     * // => 5
     */
    exports.bytes = function (string, doubleLength) {
        string += '';
        doubleLength = doubleLength || 2;

        var i = 0,
            j = string.length,
            k = 0,
            c;

        for (; i < j; i++) {
            c = string.charCodeAt(i);
            k += (c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f) ? 1 : doubleLength;
        }

        return k;
    };


    /**
     * 计算字符串长度
     * 双字节的字符使用 length 属性计算不准确
     * @ref http://es6.ruanyifeng.com/#docs/string
     * @param str {String} 原始字符串
     * @returns {Number}
     *
     * @example
     * var s = "𠮷";
     * s.length = 2;
     * string.length(s);
     * // => 3
     */
    exports.length = function (str) {
        return String(str).replace(REG_NOT_UTF16_SINGLE, '*').length;
    };
});










