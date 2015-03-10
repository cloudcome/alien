/*!
 * querystring.js
 * @author ydr.me
 * @ref https://github.com/joyent/node/blob/master/lib/querystring.js
 * @create 2014-09-19 16:30
 */


define(function (require, exports, module) {
    /**
     * querystring 的解析与设置<br>
     * 合法的 querstring 为<code>a=1&b=2&c=3&c=4&c=5</code>
     *
     * @module core/navigator/querystring
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/querystring
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var qs = require('../../utils/querystring.js');


    /**
     * 获取当前 querystring 中的键值
     * @param {String|Array} [key] 键
     * @returns {String|Object|undefined}
     *
     * @example
     * qs.get();
     * qs.get('a');
     * qs.get(['a', 'b']);
     */
    exports.get = function (key) {
        var parse = qs.parse(location.search);
        var ret;
        var keyType = typeis(key);

        switch (keyType) {
            case 'array':
                ret = {};
                dato.each(key, function (i, k) {
                    ret[k] = parse[k];
                });

                return ret;

            case 'string':
                return parse[key];

            default :
                return parse;
        }
    };


    /**
     * 设置当前 querystring 中的键值
     * @param {String|Object} key 键或键值对
     * @param {String} [val] 值
     *
     * @example
     * qs.set('a', '1');
     * qs.set('b', ['1', '2']);
     * qs.set({
     *    a: 1,
     *    b: 2,
     *    c: [3, 4, 5]
     * });
     */
    exports.set = function (key, val) {
        var ret = qs.parse(location.search);
        var setter = {};

        if (arguments.length === 2) {
            setter[key] = val;
        } else {
            setter = key;
        }

        dato.extend(true, ret, setter);

        location.search = qs.stringify(ret);
    };


    /**
     * 移除当前 querystring 的键
     * @param {String|Array|undefined} [key] 键或键数组
     *
     * @example
     * qs.remove();
     * qs.remove('a');
     * qs.remove(['a', 'b']);
     */
    exports.remove = function (key) {
        if (!location.search) {
            return;
        }

        if (!arguments.length) {
            location.search = '';
            return;
        }

        var parse = qs.parse(location.search);
        var clone = dato.extend(true, {}, parse);
        var compare;

        if (typeis(key) !== 'array') {
            key = [key];
        }

        dato.each(key, function (index, k) {
            delete(parse[k]);
        });

        compare = dato.compare(clone, parse);

        // 没有第一个对象独有的键
        if (!compare.only[0].length) {
            return;
        }

        location.search = qs.stringify(parse);
    };
});