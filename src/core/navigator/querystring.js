/*!
 * querystring.js
 * @author ydr.me
 * @ref https://github.com/joyent/node/blob/master/lib/querystring.js
 * @create 2014-09-19 16:30
 */


define(function (require, exports, module) {
    /**
     * @module core/navigator/querystring
     * @requires util/data
     */
    'use strict';

    var data = require('../../util/data.js');
    var regSp = /\+/g;
    var regQ = /^\?+/;

    module.exports = {
        /**
         * 字符化
         * @param {Object} object query 对象
         * @param {String} [sep] 分隔符，默认&
         * @param {String} [eq] 等于符，默认=
         * @returns {String}
         */
        stringify: function (object, sep, eq) {
            sep = sep || '&';
            eq = eq || '=';

            if (data.type(object) !== 'object') {
                return '';
            }

            var ret = [];

            data.each(object, function (key, val) {
                var type = _isSafe(val);
                if (type === !0) {
                    ret.push(_encode(key) + eq + _clean(val));
                } else if (type === 'array') {
                    data.each(val, function (k, v) {
                        ret.push(_encode(key) + eq + _clean(v));
                    });
                }
            });

            return ret.join(sep);
        },
        /**
         * 解析
         * @param {String} querystring 字符串
         * @param {String} [sep] 分隔符，默认&
         * @param {String} [eq] 等于符，默认=
         * @returns {Object}
         */
        parse: function (querystring, sep, eq) {
            sep = sep || '&';
            eq = eq || '=';

            var ret = {};
            var type = data.type(querystring);
            var arr;

            if (type !== 'string') {
                return ret;
            }

            // 最大长度100
            arr = querystring.replace(regQ, '').split(sep).slice(0, 100);

            data.each(arr, function (index, item) {
                var temp = item.split(eq);
                var key = _decode(temp[0].replace(regSp, ' '));
                var val = _decode(temp.slice(1).join(''));

                if (key.length) {
                    if (!ret[key]) {
                        ret[key] = val;
                    } else {
                        if (data.type(ret[key]) !== 'array') {
                            ret[key] = [ret[key]];
                        }

                        ret[key].push(val);
                    }
                }
            });

            return ret;
        },
        /**
         * 获取当前 querystring 中的键值
         * @param {String} key 键
         * @returns {String|undefined}
         */
        get: function (key) {
            return this.parse(location.search)[key];
        },
        /**
         * 设置当前 querystring 中的键值
         * @param {String|Object} key 键或键值对
         * @param {String} [val] 值
         */
        set: function (key, val) {
            var ret = this.parse(location.search);
            var setter = {};

            if (arguments.length === 2) {
                setter[key] = val;
            } else {
                setter = key;
            }

            data.extend(!0, ret, setter);

            location.search = this.stringify(ret);
        },
        /**
         * 移除当前 querystring 的键
         * @param {String|Array|undefined} [key] 键或键数组
         */
        remove: function (key) {
            if (!arguments.length) {
                location.search = '';
                return;
            }

            var ret = this.parse(location.search);

            if (data.type(key) !== 'array') {
                key = [key];
            }

            data.each(key, function (index, k) {
                delete(ret[k]);
            });

            location.search = this.stringify(ret);
        }
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
        var type = data.type(object);
        var ret = type === 'string' || type === 'boolean' || type === 'number' && isFinite(object);

        return ret === !0 ? !0 : type;
    }


    /**
     * 清理数据
     * @param {*} object
     * @returns {string}
     * @private
     */
    function _clean(object) {
        if (_isSafe(object) === !0) {
            return _encode(object.toString());
        }

        return '';
    }
});