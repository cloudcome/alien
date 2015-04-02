/*!
 * hashbang.js
 * @author ydr.me
 * 2014-09-24 14:50
 */


define(function (require, exports) {
    /**
     * URL 的 hash 部分解析与设置<br>
     * 支持的 hashbang 格式为<code>#!/foo/bar/?a=1&b=2&b=3</code><br>
     * 必须以<code>#!</code>开头，后续的 querystring 必须符合标准
     *
     * @module core/navigator/hashbang
     * @requires utils/allocation
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/hashbang
     */
    'use strict';

    var allocation = require('../../utils/allocation.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var hashbang = require('../../utils/hashbang.js');
    var hasEmit = false;


    /**
     * 设置当前 hashbang
     * @param {String} part 设置部分，分别为`path`或`query`
     * @param {String} key 设置键、键值对
     * @param {String} [val] 键值
     *
     * @example
     * // path
     * hashbang.set('path', ['a']);
     *
     * // query
     * hashbang.set('query', 'a', 1);
     * hashbang.set('query', {
     *     a: 2,
     *     b: 3
     * });
     */
    exports.set = function (part, key, val) {
        if (!_isSafePart(part)) {
            throw new Error('hashbang `part` must be `path` or `query`');
        }

        var parse = hashbang.parse(location.hash);
        var map;
        var keyType = typeis(key);
        var valSafe = _isSafeVal(val);

        if (part === 'query') {
            if (keyType === 'string' && valSafe === true || keyType === 'object') {
                if (keyType === 'object') {
                    map = key;
                } else {
                    map = {};
                    map[key] = val;
                }

                parse.query = dato.extend({}, parse.query, map);
            } else {
                throw new Error('`key` must be a object or `key` must b a string, ' +
                '`val` must be a string/number/boolean');
            }
        } else {
            if (keyType === 'array') {
                parse.path = key;
            } else {
                throw new Error('`key` must be an array');
            }
        }

        location.hash = hashbang.stringify(parse);
    };


    /**
     * 移除键值
     * @param {String} part 可以为`path`或`query`
     * @param {Array|String|Number} key 移除键
     *
     * @example
     * // path
     * hashbang.remove('path', 0);
     * hashbang.remove('path', [0, 1]);
     *
     * // query
     * hashbang.remove('query', 'a');
     * hashbang.remove('query', ['a', 'b']);
     */
    exports.remove = function (part, key) {
        if (!_isSafePart(part)) {
            throw new Error('hashbang `part` must be `path` or `query`');
        }

        var keyType = typeis(key);
        var removeKeys = [];
        var parse = hashbang.parse(location.hash);

        if (part === 'path') {
            if (keyType === 'array') {
                removeKeys = key;
            } else {
                removeKeys.push(key);
            }

            dato.each(removeKeys, function (index, key) {
                if (typeis(key) === 'number') {
                    parse.path.splice(key - index, 1);
                }
            });
        } else {
            if (keyType === 'array') {
                removeKeys = key;
            } else {
                removeKeys.push(key);
            }

            dato.each(removeKeys, function (index, key) {
                if (typeis(key) === 'string') {
                    delete(parse.query[key]);
                }
            });
        }

        location.hash = hashbang.stringify(parse);
    };

    /**
     * 获取 hashbang 的键值
     * @param {String} [part] 获取部分，分别为`path`或`query`，为空表示获取全部解析
     * @param {Number|String} [key] 键，为空表示返回该部分全部解析
     * @returns {Object|String|undefined} 返回值
     *
     * @example
     * // all
     * hashbang.get();
     * // => {path: ["b", "c"], query: {a:"2", b: "3"}}
     *
     * // path
     * hashbang.get('path');
     * // => ["b", "c"]
     * hashbang.get('path', 0);
     * // => "b"
     *
     * // query
     * hashbang.get('query');
     * // => {a:"2", b: "3"}
     * hashbang.get('query', 'a');
     * // => "2"
     */
    exports.get = function (part, key) {
        var keyType = typeis(key);
        var args = allocation.args(arguments);
        var argL = args.length;
        var parse = hashbang.parse(location.hash);

        if (argL === 0) {
            return parse;
        }

        if (!_isSafePart(part)) {
            throw new Error('hashbang `part` must be `path` or `query`');
        }

        if (argL === 1) {
            return parse[part];
        } else if (argL === 2 && (part === 'path' && keyType === 'number' || part === 'query' && keyType === 'string')) {
            return parse[part][key];
        } else {
            throw new Error('`path` key must be a number, `query` key must be a string');
        }
    };


    /**
     * 路由监听
     * @param routerConfig {Array} 路由配置
     * @param [options] {Object} 参数
     * @param [options.isIgnoreCase=false] {Boolean} 是否忽略大小写
     * @param [options.isIgnoreEndSlash=true] {Boolean} 是否忽略结尾斜杠
     *
     * @example
     * hashbang.routers([
     *    {
     *       router: '/user/:userId',
     *       callback: fn1
     *    },
     *    {
     *        router: '/user/:userId/page/:pageNum',
     *        callback: fn2
     *    }
     * ]);
     */
    exports.routers = function (routerConfig, options) {
        hashbang.on('path', function (eve) {
            var matched = null;
            var matchIndex = -1;
            var matchKey = '';

            dato.each(routerConfig, function (index, routerConfig) {
                matchKey = Object.keys(routerConfig);
                matched = hashbang.matches(eve.newURL, matchKey, options);
                matchIndex = index;

                if (matched) {
                    return false;
                }
            });

            if (matched && matchIndex > -1) {
                var callbacks = typeis.array(routerConfig[matchIndex][matchKey])
                    ? routerConfig[matchIndex][matchKey]
                    : [routerConfig[matchIndex][matchKey]];

                callbacks.forEach(function (callback) {
                    callback(matched);
                });
            }
        });

        // 主动触发一次 hashchange
        if (!hasEmit) {
            hasEmit = true;
            hashbang.emit();
        }
    };


    /**
     * hashbang 监听
     * @type {exports.on}
     */
    exports.on = hashbang.on;


    /**
     * 判断 hashbang 部分是否合法
     * @param {*} part
     * @returns {boolean}
     * @private
     */
    function _isSafePart(part) {
        return part === 'path' || part === 'query';
    }


    /**
     * 数据是否安全
     * @param {*} object
     * @returns {Boolean|String} 如果安全返回true，否则返回数据类型
     * @private
     */
    function _isSafeVal(object) {
        var type = typeis(object);
        var ret = type === 'string' || type === 'boolean' || type === 'number' && isFinite(object);

        return ret === true ? true : type;
    }
});