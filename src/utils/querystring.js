/*!
 * querystring.js
 * @author ydr.me
 * @ref https://github.com/joyent/node/blob/master/lib/querystring.js
 * @create 2014-09-19 16:30
 */


define(function (require, exports) {
    /**
     * querystring 的解析与设置<br>
     * 合法的 querstring 为<code>a=1&b=2&c=3&c=4&c=5</code>
     *
     * @module utils/querystring
     * @requires utils/dato
     * @requires utils/typeis
     */
    'use strict';

    var dato = require('./dato.js');
    var typeis = require('./typeis.js');
    var regSp = /\+/g;
    //var REG_SPLIT = /[\?#]/g;


    ///**
    // * 获取 URL 上的 querystring
    // * @param url {String} url
    // * @param [isReturnAll=false] {Boolean} 是否返回所有字段
    // * @returns {String|Array}
    // */
    //exports.get = function (url, isReturnAll) {
    //    var arr = (url + '').split(REG_SPLIT);
    //
    //    if (!isReturnAll) {
    //        return arr[1] || '';
    //    }
    //
    //    return [arr.shift(), arr.shift(), arr.join('#')];
    //};


    /**
     * 字符化
     * @param {Object} object query 对象
     * @param {String} [sep] 分隔符，默认&
     * @param {String} [eq] 等于符，默认=
     * @returns {String}
     *
     * @example
     * querystring.stringify({a:1,b:[1,2,3]});
     * // => "a=1&b=1&b=2&b=3"
     */
    exports.stringify = function (object, sep, eq) {
        sep = sep || '&';
        eq = eq || '=';

        if (typeis(object) !== 'object') {
            return '';
        }

        var ret = [];

        dato.each(object, function (key, val) {
            var type = _isSafe(val);
            if (type === true) {
                ret.push(_encode(key) + eq + _clean(val));
            } else if (type === 'array') {
                dato.each(val, function (k, v) {
                    ret.push(_encode(key) + eq + _clean(v));
                });
            }
        });

        return ret.join(sep);
    };


    /**
     * 解析
     * @param {String} querystring 字符串
     * @param {String} [sep] 分隔符，默认&
     * @param {String} [eq] 等于符，默认=
     * @returns {Object}
     *
     * @example
     * querystring.parse("a=1&b=1&b=2&b=3");
     * // => {a: "1",b: ["1","2","3"]}
     */
    exports.parse = function (querystring, sep, eq) {
        sep = sep || '&';
        eq = eq || '=';

        var ret = {};
        var type = typeis(querystring);
        var arr;

        if (type !== 'string') {
            return ret;
        }

        // 最大长度100
        arr = querystring.split(sep).slice(0, 100);

        dato.each(arr, function (index, item) {
            var temp = item.split(eq);
            var key = _decode(temp[0].replace(regSp, ' '));
            var val = _decode(temp.slice(1).join(''));

            if (key.length) {
                if (!ret[key]) {
                    ret[key] = val;
                } else {
                    if (typeis(ret[key]) !== 'array') {
                        ret[key] = [ret[key]];
                    }

                    ret[key].push(val);
                }
            }
        });

        return ret;
    };


    /**
     * 编码
     * @param {String} string 字符串
     * @returns {string}
     * @private
     */
    function _encode(string) {
        return encodeURIComponent(string);
    }

    /**
     * 解码
     * @param {String} string 字符串
     * @returns {string}
     * @private
     */
    function _decode(string) {
        try {
            return decodeURIComponent(string);
        } catch (err) {
            return '';
        }
    }

    /**
     * 数据是否安全
     * @param {*} object
     * @returns {Boolean|String} 如果安全返回true，否则返回数据类型
     * @private
     */
    function _isSafe(object) {
        var type = typeis(object);
        var ret = type === 'string' || type === 'boolean' || type === 'number' && isFinite(object);

        return ret === true ? !0 : type;
    }


    /**
     * 清理数据
     * @param {*} object
     * @returns {string}
     * @private
     */
    function _clean(object) {
        if (_isSafe(object) === true) {
            return _encode(object.toString());
        }

        return '';
    }
});