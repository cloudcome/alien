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
    var REG_FORMAT = {
        3: /(\d)(?=(\d{3})+$)/g
    };
    // k,m,g,t,p
    // @ref http://searchstorage.techtarget.com/definition/Kilo-mega-giga-tera-peta-and-all-that
    var abbrSuffix = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
    var REG_BEGIN_0 = /^0+/;


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
     * @param [splitLength=3] {Number} 分隔长度
     * @returns {string} 分割后的字符串
     * @example
     * number.format(123456.789);
     * // => "123,456.789"
     * number.format(123456.789, '-');
     * // => "123-456.789"
     */
    exports.format = function (num, separator, splitLength) {
        if (typeis.number(separator)) {
            splitLength = separator;
            separator = ',';
        } else {
            separator = separator || ',';
            splitLength = splitLength || 3;
        }

        var reg = REG_FORMAT[splitLength];

        if (!reg) {
            // /(\d)(?=(\d{3})+$)/g
            reg = REG_FORMAT[splitLength] = new RegExp('(\\d)(?=(\\d{' + splitLength + '})+$)', 'g');
        }

        var arr = String(num).split('.');
        var p1 = arr[0].replace(reg, '$1' + separator);

        return p1 + (arr[1] ? '.' + arr[1] : '');
    };


    /**
     * 数字缩写
     * @param num {Number} 数值
     * @param [fixedLength=0] {Number} 修正长度
     * @param [step=1000] {Number} 步长
     * @returns {*}
     * @example
     * number.abbr(123456.789);
     * // => "123k"
     * number.abbr(123456.789, 2);
     * // => "123.46k"
     */
    exports.abbr = function (num, fixedLength, step) {
        if (num < 1) {
            return num;
        }

        // 123.321 => 123
        num = exports.parseInt(num, 0);
        fixedLength = fixedLength || 0;
        step = step || 1000;

        var i = 0;
        var j = abbrSuffix.length;

        while (num >= step && ++i < j) {
            num = num / step;
        }

        if (i === j) {
            i = j - 1;
        }

        return exports.format(num.toFixed(fixedLength)) + abbrSuffix[i];
    };


    /**
     * 比较两个长整型数值
     * @param long1 {String|Number} 长整型数值字符串1
     * @param long2 {String|Number} 长整型数值字符串2
     * @param [operator=">"] {String} 比较操作符，默认比较 long1 > long2
     * @returns {*}
     * @example
     * number.than('9999999999999999999999999999999999999999', '9999999999999999999999999999999999999998');
     * // => true
     */
    exports.than = function (long1, long2, operator) {
        operator = operator || '>';
        long1 = String(long1).replace(REG_BEGIN_0, '');
        long2 = String(long2).replace(REG_BEGIN_0, '');

        // 1. 比较长度
        if (long1.length > long2.length) {
            return operator === '>';
        } else if (long1.length < long2.length) {
            return operator === '<';
        }

        // 15位是安全值
        var long1List = exports.format(long1, ',', 15).split(',');
        var long2List = exports.format(long2, ',', 15).split(',');

        // 2. 遍历比较
        var ret = false;

        long1List.forEach(function (number1, index) {
            var number2 = long2List[index];

            if (number1 > number2) {
                ret = operator === '>';
                return false;
            } else if (number1 < number2) {
                ret = operator === '<';
                return false;
            }
        });

        return ret;
    };
});















