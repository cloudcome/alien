/*!
 * 随机数
 * @author ydr.me
 * @create 2014-10-30 19:03
 */


define(function (require, exports) {
    /**
     * @module utils/random
     * @requires utils/dato
     * @requires utils/number
     */
    'use strict';

    var dato = require('./dato.js');
    var number = require('./number.js');
    var regExist = /[aA0]/g;
    var dictionaryMap = {
        a: 'abcdefghijklmnopqrstuvwxyz',
        A: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        0: '0123456789'
    };

    /**
     * 随机数字
     * @param [min=0] {Number} 最小值，默认0
     * @param [max=0] {Number} 最大值，默认0
     * @returns {Number}
     *
     * @example
     * random.number(1, 3);
     * // => 1 or 2 or 3
     */
    exports.number = function (min, max) {
        var temp;

        min = number.parseInt(min, 0);
        max = number.parseInt(max, 0);

        if (min === max) {
            return min;
        }

        if (min > max) {
            temp = min;
            min = max;
            max = temp;
        }

        return Math.floor(Math.random() * (max - min + 1) + min);
    };


    /**
     * 随机字符串
     * @param [length=6] {Number} 随机字符串长度
     * @param [dictionary='aA0'] {String} 字典
     *
     * @example
     * // 字典对应关系
     * // a => a-z
     * // A => A-Z
     * // 0 => 0-9
     * // 其他字符
     * random.string(6, 'a');
     * // => abcdef
     * random.string(6, '!@#$%^&*()_+');
     * // => @*)&(^
     */
    exports.string = function (length, dictionary) {
        var ret = '';
        var pool = '';
        var max;

        length = Math.abs(number.parseInt(length, 6));
        dictionary = String(dictionary || 'a');

        if (dictionary.indexOf('a') > -1) {
            pool += dictionaryMap.a;
        }

        if (dictionary.indexOf('A') > -1) {
            pool += dictionaryMap.A;
        }

        if (dictionary.indexOf('0') > -1) {
            pool += dictionaryMap[0];
        }

        pool += dictionary.replace(regExist, '');
        max = pool.length - 1;

        while (length--) {
            ret += pool[exports.number(0, max)];
        }

        return ret;
    };


    /**
     * 随机16进制颜色值
     * @returns {string}
     *
     * @example
     * random.color()
     * => '#ff00ff'
     */
    exports.color = function () {
        return '#' + Math.random().toString(16).substr(-6);
    };
});