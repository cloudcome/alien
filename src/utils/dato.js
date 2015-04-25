/*!
 * data-traveller.js
 * @author ydr.me
 * 2014-09-14 17:26
 */


define(function (require, exports, module) {
    /**
     * @module utils/dato
     * @requires utils/typeis
     */

    'use strict';

    var typeis = require('./typeis.js');
    var udf;
    var canListTypeArr = 'array object nodelist htmlcollection arguments namednodemap'.split(' ');
    var REG_NOT_UTF16_SINGLE = /[^\x00-\xff]{2}/g;
    var REG_STRING_FIX = /[.*+?^=!:${}()|[\]\/\\]/g;
    var REG_BEGIN_0 = /^0+/;


    /**
     * 格式化数字，如果是非数字则返回默认值
     * @param {*} [obj] 待格式化对象
     * @param {*} [dft] 非数字时的默认值
     * @returns {*}
     */
    exports.parseInt = function (obj, dft) {
        obj = parseInt(obj, 10);

        return isNaN(obj) ? dft : obj;
    };


    /**
     * 格式化数字，如果是非数字则返回默认值
     * @param {*} obj 待格式化对象
     * @param {*} [dft] 非数字时的默认值
     * @returns {*}
     */
    exports.parseFloat = function (obj, dft) {
        obj = parseFloat(obj);

        return isNaN(obj) ? dft : obj;
    };


    /**
     * 遍历元素
     * @param {Array/Object} list  数组、可枚举对象
     * @param {Function} callback  回调，返回false时停止遍历
     * @param {*} [context] 上下文
     *
     * @example
     * // 与 jQuery.each 一样
     * // 返回 false 时将退出当前遍历
     * data.each(list, function(key, val){});
     */
    exports.each = function (list, callback, context) {
        var i;
        var j;

        // 数组 或 类似数组
        if (list && list.length !== udf) {
            for (i = 0, j = exports.parseInt(list.length, 0); i < j; i++) {
                context = context || window;
                if (callback.call(context, i, list[i]) === false) {
                    break;
                }
            }
        }
        // 纯对象
        else if (list !== null && list !== udf) {
            for (i in list) {
                if (list.hasOwnProperty(i)) {
                    context = context || window;
                    if (callback.call(context, i, list[i]) === false) {
                        break;
                    }
                }
            }
        }
    };


    /**
     * 扩展静态对象
     * @param {Boolean|Object} [isExtendDeep] 是否深度扩展，可省略，默认false
     * @param {Object}  [source] 源对象
     * @param {...Object}  [target] 目标对象，可以是多个
     * @returns {*}
     *
     * @example
     * // 使用方法与 jQuery.extend 一样
     * var o1 = {a: 1};
     * var o2 = {b: 2};
     * var o3 = data.extend(true, o1, o2);
     * // => {a: 1, b: 2}
     * o1 === o3
     * // => true
     *
     * // 如果不想污染原始对象，可以传递一个空对象作为容器
     * var o1 = {a: 1};
     * var o2 = {b: 2};
     * var o3 = data.extend(true, {}, o1, o2);
     * // => {a: 1, b: 2}
     * o1 === o3
     * // => fale
     */
    exports.extend = function (isExtendDeep, source, target) {
        var args = arguments;
        var firstArgIsBoolean = typeof(args[0]) === 'boolean';
        var current = firstArgIsBoolean ? 1 : 0;
        var length = args.length;
        var i;
        var obj;
        var sourceType;
        var objType;

        isExtendDeep = firstArgIsBoolean && args[0] === true;
        source = args[current++];

        for (; current < length; current++) {
            obj = args[current];
            for (i in obj) {
                if (obj.hasOwnProperty(i) && obj[i] !== undefined) {
                    sourceType = typeis(source[i]);
                    objType = typeis(obj[i]);

                    if (objType === 'object' && isExtendDeep) {
                        source[i] = sourceType !== objType ? {} : source[i];
                        exports.extend.call(this, isExtendDeep, source[i], obj[i]);
                    } else if (objType === 'array' && isExtendDeep) {
                        source[i] = sourceType !== objType ? [] : source[i];
                        exports.extend.call(this, isExtendDeep, source[i], obj[i]);
                    } else {
                        source[i] = obj[i];
                    }
                }
            }
        }

        return source;
    };


    /**
     * 萃取
     * @param data {Object} 传递的数据
     * @param keys {Array} 摘取的键数组
     * @param [filter] {Function} 过滤方法，默认取不为 undefined 键值
     * @returns {Object}
     */
    exports.pick = function (data, keys, filter) {
        var data2 = {};

        data = data || {};

        filter = filter || function (val) {
                return val !== udf;
            };

        keys.forEach(function (key) {
            if (filter(data[key])) {
                data2[key] = data[key];
            }
        });

        return data2;
    };


    /**
     * 转换对象为一个纯数组，只要对象有length属性即可
     * @param {Object} [obj] 对象
     * @param {Boolean} [isConvertWhole] 是否转换整个对象为数组中的第0个元素，当该对象无length属性时，默认false
     * @returns {Array}
     *
     * @example
     * var o = {0:"foo", 1:"bar", length: 2}
     * data.toArray(o);
     * // => ["foo", "bar"]
     *
     * var a1 = [1, 2, 3];
     * // 转换后的数组是之前的副本
     * var a2 = data.toArray(a1);
     * // => [1, 2, 3]
     * a2 === a1;
     * // => false
     */
    exports.toArray = function (obj, isConvertWhole) {
        var ret = [];
        var i = 0;
        var j;
        var objType = typeis(obj);

        if (canListTypeArr.indexOf(objType) > -1 && typeis(obj.length) === 'number' && obj.length >= 0) {
            for (j = obj.length; i < j; i++) {
                ret.push(obj[i]);
            }
        } else if (obj && isConvertWhole) {
            ret.push(obj);
        }

        return ret;
    };


    /**
     * 计算字节长度
     * @param string {String} 原始字符串
     * @param [doubleLength=2] {Number} 双字节长度，默认为2
     * @returns {number}
     *
     * @example
     * dato.bytes('我123');
     * // => 5
     */
    exports.bytes = function (string, doubleLength) {
        string += '';
        doubleLength = exports.parseInt(doubleLength, 2);

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
     * @param string {String} 原始字符串
     *
     * @example
     * var s = "𠮷";
     * s.length = 2;
     * dato.length(s);
     * // => 1
     */
    exports.length = function (string) {
        string += '';

        return string.replace(REG_NOT_UTF16_SINGLE, '*').length;
    };


    /**
     * 对象1级比较，找出相同和不同的键
     * @param obj1 {Object|Array}
     * @param obj2 {Object|Array}
     * @returns {Object}
     *
     * @example
     * data.compare({a:1,b:2,c:3}, {a:1,d:4});
     * // =>
     * // {
     * //    same: ["a"],
     * //    only: [
     * //       ["b", "c"],
     * //       ["d"]
     * //    ],
     * //    diff: ["b", "c", "d"]
     * // }
     */
    exports.compare = function (obj1, obj2) {
        var obj1Type = typeis(obj1);
        var obj2Type = typeis(obj2);
        var obj1Only = [];
        var obj2Only = [];
        var diff = [];
        var same = [];

        // 类型不同
        if (obj1Type !== obj2Type) {
            return null;
        }

        // 对象
        if (obj1Type === 'object' || obj1Type === 'array') {
            exports.each(obj1, function (key, val) {
                if (obj2[key] !== val) {
                    diff.push(key);
                } else {
                    same.push(key);
                }

                if (typeis.undefined(obj2[key])) {
                    obj1Only.push(key);
                }
            });

            exports.each(obj2, function (key, val) {
                if (obj1[key] !== val && diff.indexOf(key) === -1) {
                    diff.push(key);
                }

                if (typeis.undefined(obj1[key])) {
                    obj2Only.push(key);
                }
            });

            return {
                same: same,
                only: [
                    obj1Only,
                    obj2Only
                ],
                diff: diff
            };
        } else {
            return null;
        }
    };


    /**
     * 人类数字，千位分割
     * @param number {String|Number} 数字（字符串）
     * @param [separator=","] {String} 分隔符
     * @param [length=3] {Number} 分隔长度
     * @returns {string} 分割后的字符串
     */
    exports.humanize = function (number, separator, length) {
        separator = separator || ',';
        length = length || 3;

        var reg = new RegExp('(\\d)(?=(\\d{' + length + '})+$)', 'g');
        var arr = String(number).split('.');
        var p1 = arr[0].replace(reg, '$1' + separator);

        return p1 + (arr[1] ? '.' + arr[1] : '');
    };


    /**
     * 比较两个长整型数值
     * @param long1 {String|Number} 长整型数值字符串1
     * @param long2 {String|Number} 长整型数值字符串2
     * @param [operator=">"] {String} 比较操作符，默认比较 long1 > long2
     * @returns {*}
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

        var long1List = exports.humanize(long1, ',', 15).split(',');
        var long2List = exports.humanize(long2, ',', 15).split(',');

        //[
        // '123456',
        // '789012345678901',
        // '234567890123456',
        // '789012345678901',
        // '234567890123457'
        // ]

        //// 2. 比较数组长度
        //if (long1List.length > long2List.length) {
        //    return operator === '>';
        //} else if (long1List.length < long2List.length) {
        //    return operator === '<';
        //}

        // 2. 遍历比较
        var ret = false;

        exports.each(long1List, function (index, number1) {
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


    /**
     * 按长度填满指定字符
     * @param {Number|String} orginalString 原始字符串
     * @param {Number} length 长度
     * @param {String} [fixString="0"] 补充的字符
     * @param {Boolean} [isSuffix=false] 是否添加为后缀，默认前缀
     * @returns {String}
     *
     * @example
     * dato.fillString('2', 4);
     * // => "0002"
     */
    exports.fillString = function (orginalString, length, fixString, isSuffix) {
        var len = length;
        var fixedString = '';
        var args = arguments;
        var argL = args.length;

        // dato.fillString(originalString, length, isSuffix);
        // dato.fillString(originalString, length, fixString, isSuffix);
        if (typeis.boolean(args[argL - 1])) {
            fixString = argL === 4 ? args[2] : '0';
            isSuffix = args[argL - 1];
        }
        // dato.fillString(originalString, length);
        // dato.fillString(originalString, length, fixString);
        else {
            fixString = argL === 3 ? args[2] : '0';
            isSuffix = false;
        }

        while (len--) {
            fixedString += fixString;
        }

        return isSuffix ?
            (orginalString + fixedString).slice(0, length) :
            (fixedString + orginalString).slice(-length);
    };


    /**
     * 修正正则字符串
     * @param regExpString
     * @returns {String}
     *
     * @example
     * data.fixRegExp('/');
     * // => '\/'
     */
    exports.fixRegExp = function (regExpString) {
        return regExpString.replace(REG_STRING_FIX, '\\$&');
    };


    /////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////[ ONLY BROWSER ]///////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////


    /**
     * base64 编码
     * @param ascii {String} ascii 字符串
     * @returns {String} base64 字符串
     */
    exports.btoa = function (ascii) {
        return window.btoa(encodeURIComponent(String(ascii)));
    };


    /**
     * base64 解码
     * @param base64 {String} base64 字符串
     * @returns {String} ascii 字符串
     */
    exports.atob = function (base64) {
        try {
            return decodeURIComponent(window.atob(String(base64)));
        } catch (err) {
            return '';
        }
    };
});