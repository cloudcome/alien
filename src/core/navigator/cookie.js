/*!
 * cookie 操作
 * @author ydr.me
 * @create 2014-10-30 10:42
 */


define(function (require, exports) {
    /**
     * @module core/navigator/cookie
     * @requires utils/dato
     * @requires utils/typeis
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var allocation = require('../../utils/allocation.js');
    var defaults = {
        // 是否以严格模式读取和设置cookie，默认true
        // 严格模式下，将在读之后、写之前都会进行<code>encodeURIComponent</code>、<code>decodeURIComponent</code>操作
        isStrict: true,
        // 在无域名的时候，必须设置为空才能在本地写入
        domain: location.hostname === 'localhost' ? '' : location.hostname,
        // 默认cookie有效期1个小时（单位秒）
        expires: 3600,
        // 默认cookie存储路径
        path: '/',
        // 是否加密cookie
        secure: false
    };
    var cookie = function (key, val, options, isGet) {
        var args = dato.toArray(arguments);

        options = dato.extend(true, {}, defaults, options);
        args.pop();
        return allocation.getset({
            get: function (key) {
                return _parse(options.isStrict)[key];
            },
            set: function (key, val) {
                _set(key, val, options);
            }
        }, args);
    };

    /**
     * 获取当前可读 cookie
     * @param [key] {String} cookie 键，可选，为空时返回所有
     * @param [options] {Object} 配置
     * @param [options.isStrict=true] {Boolean} 是否严格模式，默认true
     * @returns {String|Object}
     */
    exports.get = function (key, options) {
        return cookie(key, undefined, options);
    };


    /**
     * 设置一个或多个 cookie
     * @param key {String|Object}
     * @param [val] {String|Object}
     * @param [options] {Object} 配置
     * @param [options.isStrict=true] {Boolean} 是否严格模式，默认true
     * @param [options.domain] {String} 域，默认为 localhost.hostname
     * @param [options.expires=3600] {Number} 默认为3600，单位s
     * @param [options.path="/"] {String} 路径
     * @param [options.secure=false] {Boolean} 是否加密
     */
    exports.set = function (key, val, options) {
        cookie(key, val, options);
    };


    /**
     * 删除一个或多个 cookie
     * @param key {String|Array}
     * @param [options] {Object} 配置
     * @param [options.isStrict=true] {Boolean} 是否严格模式，默认true
     * @param [options.domain] {String} 域，默认为 localhost.hostname
     * @param [options.path="/"] {String} 路径
     * @param [options.secure=false] {Boolean} 是否加密
     * @returns {Boolean} true
     */
    exports.remove = function (key, options) {
        var map = {};

        if (typeis(key) === 'array') {
            dato.each(key, function (i, k) {
                map[k] = '';
            });
        } else {
            map[key] = '';
        }

        options = dato.extend(true, {}, defaults, options, {
            expires: -1
        });

        return exports.set(map, options);
    };


    /**
     * 解析当前 cookie
     * @param isStrict {Boolean} 是否严格模式
     * @returns {{}}
     * @private
     */
    function _parse(isStrict) {
        var arr = document.cookie.split(';');
        var ret = {};

        dato.each(arr, function (i, chunk) {
            var part = chunk.split('=');

            part[0] = part[0].trim();
            part[0] = isStrict ? _decode(part[0]) : part[0];

            if (part[0]) {
                ret[part[0]] = isStrict ? _decode(part[1]) : part[1];
            }
        });

        return ret;
    }


    /**
     * 设置 cookie
     * @param key
     * @param val
     * @param options
     * @private
     */
    function _set(key, val, options) {
        if (options.isStrict) {
            key = _encode(key);
            val = _encode(val);
        }

        var d = new Date();
        var ret = [key + '=' + val];

        d.setTime(d.getTime() + options.expires * 1000);
        ret.push('expires=' + d.toUTCString());

        if (options.path) {
            ret.push('path=' + options.path);
        }

        if (options.domain) {
            ret.push('domain=' + options.domain);
        }

        if (options.secure) {
            ret.push('secure=secure');
        }

        document.cookie = ret.join(';') + ';';
    }

    /**
     * 编码
     * @param str
     * @returns {string}
     * @private
     */
    function _encode(str) {
        return encodeURIComponent(str);
    }

    /**
     * 解码
     * @param str
     * @returns {string}
     * @private
     */
    function _decode(str) {
        try {
            return decodeURIComponent(str);
        } catch (err) {
            return '';
        }
    }
});