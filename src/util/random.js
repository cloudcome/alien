/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-10-30 19:03
 */


define(function (require, exports) {
    /**
     * @module util/random
     */
    'use strict';

    var data = require('./data.js');
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

        min = data.parseInt(min, 0);
        max = data.parseInt(max, 0);

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
     * @param [dictionary='a'] {String} 字典
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

        length = Math.abs(data.parseInt(length, 6));
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
            ret += pool[this.number(0, max)];
        }

        return ret;
    };
});