/**
 * 随机数
 * @author ydr.me
 * @create 2014-10-30 19:03
 * @update 2015-11-24 17:28:11
 */


define(function (require, exports) {
    /**
     * @module utils/random
     * @requires utils/dato
     * @requires utils/number
     */
    'use strict';

    var dato = require('./dato.js');
    var allocation = require('./allocation.js');
    var number = require('./number.js');
    var string = require('./string.js');

    var regExist = /[aA0]/g;
    var dictionaryMap = {
        a: 'abcdefghijklmnopqrstuvwxyz',
        A: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        0: '0123456789'
    };
    var lastGuidTime = 0;
    var guidIndex = 0;

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


    /**
     * 最短 16 位长度的随机不重复字符串
     * @param [isTimeStamp=false] 是否时间戳形式
     * @param [maxLength=16] 最大长度
     * @returns {String}
     */
    exports.guid = function (isTimeStamp, maxLength) {
        var a = [];
        var d = new Date();
        var ret = '';
        var now = d.getTime();
        var args = allocation.args(arguments);
        var suffix = '';
        var minLength = 16;

        switch (args.length) {
            case 0:
                isTimeStamp = false;
                maxLength = minLength;
                break;

            case 1:
                // guid(isTimeStamp);
                if (typeof args[0] === 'boolean') {
                    maxLength = minLength;
                }
                // guid(maxLength);
                else {
                    isTimeStamp = false;
                    maxLength = args[0];
                }
                break;
        }

        maxLength = Math.max(maxLength, minLength);

        if (isTimeStamp) {
            if (now !== lastGuidTime) {
                lastGuidTime = now;
                guidIndex = 0;
            }

            now = String(now);
            var timeStampLength = now.length;
            suffix = number.to62(guidIndex++);
            suffix = string.padLeft(suffix, maxLength - timeStampLength, '0');
            ret = now + suffix;
        } else {
            // 4
            var Y = string.padLeft(d.getFullYear(), 4, '0');
            // 2
            var M = string.padLeft(d.getMonth() + 1, 2, '0');
            // 2
            var D = string.padLeft(d.getDate(), 2, '0');
            // 2
            var H = string.padLeft(d.getHours(), 2, '0');
            // 2
            var I = string.padLeft(d.getMinutes(), 2, '0');
            // 2
            var S = string.padLeft(d.getSeconds(), 2, '0');
            //// 3
            //var C = string.padLeft(d.getMilliseconds(), 3, '0');
            //// 9
            //var N = string.padLeft(process.hrtime()[1], 9, '0');

            a.push(Y);
            a.push(M);
            a.push(D);
            a.push(H);
            a.push(I);
            a.push(S);

            var dateTime = a.join('');

            if (dateTime !== lastGuidTime) {
                lastGuidTime = dateTime;
                guidIndex = 0;
            }

            suffix = number.to62(guidIndex++);
            suffix = string.padLeft(suffix, maxLength - 14, '0');
            a.push(suffix);
            ret = a.join('');
        }

        return ret;
    };
});