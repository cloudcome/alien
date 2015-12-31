/**
 * 数据转换器
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

    var w = window;
    var udf;
    var canListTypeArr = 'array object nodelist htmlcollection arguments namednodemap filelist'.split(' ');


    /**
     * 遍历元素
     * @param {Array/Object} list  数组、可枚举对象
     * @param {Function} callback  回调，返回false时停止遍历
     * @param {Boolean} [reverse=false] 数组倒序
     *
     * @example
     * // 与 jQuery.each 一样
     * // 返回 false 时将退出当前遍历
     * data.each(list, function(key, val){});
     */
    exports.each = function (list, callback, reverse) {
        var i;
        var j;

        // 数组 或 类似数组
        if (list && typeis.number(list.length)) {
            if (reverse) {
                for (i = list.length - 1, j = 0; i >= 0; i--) {
                    if (callback.call(w, i, list[i]) === false) {
                        break;
                    }
                }
            } else {
                for (i = 0, j = list.length; i < j; i++) {
                    if (callback.call(w, i, list[i]) === false) {
                        break;
                    }
                }
            }
        }
        // 纯对象
        else if (list !== null && list !== udf) {
            for (i in list) {
                if (list.hasOwnProperty(i)) {
                    if (callback.call(w, i, list[i]) === false) {
                        break;
                    }
                }
            }
        }
    };


    /**
     * 重复运行
     * @param count {Number} 重复次数
     * @param fn {Function} 重复方法
     */
    exports.repeat = function (count, fn) {
        var i = -1;

        while (++i < count) {
            if (fn(i, count) === false) {
                break;
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
    exports.select = function (data, keys, filter) {
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
});