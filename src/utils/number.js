/*!
 * 数字相关
 * @author ydr.me
 * @create 2015-05-11 13:54
 */


define(function (require, exports, module) {
    /**
     * @module utils/number
     * @reuqires utils/typeis
     */

    'use strict';

    var typeis = require('./typeis.js');
    var REG_FORMAT = /(\d)(?=(\d{3})+$)/g;
    var abbrSuffix = 'kmbt';

    /**
     * 整数化
     * @param num {*} 待转换对象
     * @param [dftNum=0] {*} 当为 NaN 时的默认值
     * @returns {*}
     */
    exports.parseInt = function (num, dftNum) {
        dftNum = dftNum || 0;
        num = parseInt(num, 10);

        return typeis.nan(num) ? dftNum : num;
    };


    /**
     * 浮点化
     * @param num {*} 待转换对象
     * @param [dftNum=0] {*} 当为 NaN 时的默认值
     * @returns {*}
     */
    exports.parseFloat = function (num, dftNum) {
        dftNum = dftNum || 0;
        num = parseFloat(num);

        return typeis.nan(num) ? dftNum : num;
    };


    /**
     * 数字格式化
     * @param num {String|Number} 数字（字符串）
     * @param [separator=","] {String} 分隔符
     * @returns {string} 分割后的字符串
     * @example
     * number.format(123456.789);
     * => "123,456.789"
     * number.format(123456.789, '-');
     * => "123-456.789"
     */
    exports.format = function (num, separator) {
        separator = separator || ',';

        var arr = String(num).split('.');
        var p1 = arr[0].replace(REG_FORMAT, '$1' + separator);

        return p1 + (arr[1] ? '.' + arr[1] : '');
    };


    /**
     * 数字缩写
     * @param num {Number} 数值
     * @param [fixedLength=0] {Number} 修正长度
     * @returns {*}
     * @example
     * number.abbr(123456.789);
     * => "123k"
     * number.abbr(123456.789, 2);
     * => "123.46k"
     */
    exports.abbr = function (num, fixedLength) {
        if (num < 1) {
            return num;
        }

        // 123.321 => 123
        num = num.toFixed(0);
        fixedLength = fixedLength || 0;

        var i = 0;
        var j = abbrSuffix.length;
        var pee = 1000;

        for (; num >= pee && i < j; i++) {
            num = num / pee;
            if (num < pee) {
                break;
            }
        }

        if (i === j) {
            i = j - 1;
        }

        return exports.format(num.toFixed(fixedLength)) + abbrSuffix[i];
    };
});















