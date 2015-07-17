/*!
 * hashbang.js
 * @author ydr.me
 * 2014-09-24 14:50
 */


define(function (require, exports, module) {
    /**
     * URL 的 hash 部分解析与设置<br>
     * 支持的 hashbang 格式为<code>#!/foo/bar/?a=1&b=2&b=3</code><br>
     * 必须以<code>#!</code>开头，后续的 querystring 必须符合标准
     *
     * @module utils/hashbang
     * @requires utils/allocation
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/querystring
     * @requires core/event/base
     */
    'use strict';

    var allocation = require('./allocation.js');
    var dato = require('./dato.js');
    var typeis = require('./typeis.js');
    var qs = require('./querystring.js');
    var event = require('../core/event/base.js');
    var regHash = /#.*$/;
    var regHashbang = /^#!\//;
    var regColon = /:(\w+\b)/g;
    var regStar = /\*/g;
    var regAsk = /\?/g;
    var regEndSlash = /\/$/;
    var regSep = /\//g;
    //var regOther = /[.+^=!${}()|[\]\\]/g;
    var pathListenerMap = {};
    var pathAllListener = [];
    var queryListenerMap = {};
    var queryAllListener = [];
    var matchesDefaults = {
        // 是否忽略大小写，默认 true
        isIgnoreCase: true,
        // 是否忽略末尾斜杠，默认 true
        isIgnoreEndSlash: true
    };
    var hashchangeCallback = function (eve) {
        var newObject = exports.parse(eve.newURL);
        var oldObject = exports.parse(eve.oldURL);
        var pathDifferentKeys = dato.compare(newObject.path || [], oldObject.path || []).diff;
        var queryDifferentKeys = dato.compare(newObject.query || {}, oldObject.query || {}).diff;
        var args = [eve, newObject, oldObject];

        if (pathDifferentKeys.length) {
            dato.each(pathAllListener, function (i, listener) {
                listener.apply(window, args);
            });
        }

        dato.each(pathDifferentKeys, function (i, key) {
            if (pathListenerMap[key]) {
                dato.each(pathListenerMap[key], function (j, listener) {
                    listener.apply(window, args);
                });
            }
        });

        if (queryDifferentKeys.length) {
            dato.each(queryAllListener, function (i, listener) {
                listener.apply(window, args);
            });
        }

        dato.each(queryDifferentKeys, function (i, key) {
            if (queryListenerMap[key]) {
                dato.each(queryListenerMap[key], function (j, listener) {
                    listener.apply(window, args);
                });
            }
        });
    };

    /**
     * 解析 hashbang 字符串为对象
     * @static
     * @param {String} hashbangString 原始字符串或URL
     * @param {String} [sep] query 部分分隔符，默认`&`
     * @param {String} [eq] query 部分等于符，默认`=`
     * @returns {Object} 包含`path`和`query`两个字段
     *
     * @example
     * hashbang.parse('#!/a/b/c?a=1&b=2');
     * // =>
     * // {
     * //    path: ["a", "b", "c"],
     * //    query: {
     * //        a: "1",
     * //        b: "2"
     * //    }
     * // }
     */
    exports.parse = function (hashbangString, sep, eq) {
        var dftRet = {path: [], query: {}};

        if (typeis(hashbangString) !== 'string') {
            return dftRet;
        }

        hashbangString = (hashbangString.match(regHash) || [''])[0];

        if (!regHashbang.test(hashbangString)) {
            return dftRet;
        }

        sep = sep || '&';
        eq = eq || '=';

        // #!/a/b/c/d/?a=1&b=2&c=3
        var hashbangGroup = hashbangString.replace(regHashbang, '/').split('#')[0];
        var hashGroup = hashbangGroup.split('?');
        var hashPathStack = [];

        dato.each(hashGroup[0].split('/'), function (index, item) {
            item = _decode(item);
            if (item.length) {
                hashPathStack.push(_decode(item));
            }
        });

        return {
            path: hashPathStack,
            query: qs.parse(hashGroup[1], sep, eq)
        };
    };

    /**
     * 将 hashbang 对象字符化
     * @param {Object} hashbangObject 对象，包含`path`和`query`两个字段
     * @param {String} [sep] query 部分分隔符，默认`&`
     * @param {String} [eq] query 部分等于符，默认`=`
     * @returns {string} hashbang 字符串
     *
     * @example
     * hashbang.stringify({
     *    path: ["a", "b", "c"],
     *    query: {
     *       a: 1,
     *       b: 2,
     *       c: 3
     *    }
     * });
     * // => "#!/a/b/c/?a=1&b=2&c=3"
     */
    exports.stringify = function (hashbangObject, sep, eq) {
        sep = sep || '&';
        eq = eq || '=';
        hashbangObject.path = hashbangObject.path || [];
        hashbangObject.query = hashbangObject.query || {};

        var hashPath = [];
        var hashQuerystring = qs.stringify(hashbangObject.query, sep, eq);

        if (typeis(hashbangObject.path) === 'string') {
            return '#!' + hashbangObject.path +
                (hashQuerystring ? '?' + hashQuerystring : '');
        }

        dato.each(hashbangObject.path, function (index, path) {
            hashPath.push(_encode(path));
        });

        return '#!' + (hashPath.length ? '/' + hashPath.join('/') : '') + '/' +
            (hashQuerystring ? '?' + hashQuerystring : '');
    };

    /**
     * 匹配 URL path 部分
     * @param {String} hashbangString hash 字符串
     * @param {String} route 正怎字符串
     * @param {Object} [options] 参数配置
     * @param {Object} [options.isIgnoreCase] 是否忽略大小写，默认 false
     * @param {Object} [options.isIgnoreEndSlash] 是否忽略末尾斜杠，默认 true
     * @returns {*}
     *
     * @example
     * 语法：
     * `/name/:name/page/:page?/`
     * 匹配：
     * /name/cloudcome/page/123/
     * /name/cloudcome/page/123
     * /name/cloudcome/page/
     * /name/cloudcome/page
     *
     * hashbang.matches('#!/id/abc123/', '/id/:id/');
     * // =>
     * // {
     * //   id: "abc123"
     * // }
     *
     * hashbang.matches('#!/name/abc123/', '/id/:id/');
     * // => null
     */
    exports.matches = function (hashbangString, route, options) {
        // /id/:id/ => /id/abc123/   √

        options = dato.extend({}, matchesDefaults, options);

        var temp;
        var keys = [0];
        var matched;
        var routeSource = route;
        var reg;
        var ret = null;

        if (typeis(hashbangString) !== 'string') {
            return ret;
        }

        temp = hashbangString.split('#');
        temp.shift();

        if(temp.length){
            hashbangString = '#' + temp.join('');
            hashbangString = '/' + hashbangString.replace(regHashbang, '').split('?')[0];
        }else{
            hashbangString = '/';
        }

        if (options.isIgnoreEndSlash) {
            route += regEndSlash.test(route) ? '?' : '/?';
        }

        route = route
            .replace(regColon, (options.isIgnoreEndSlash ? '?' : '') + '([^/]+)')
            .replace(regSep, '\\/')
            .replace(regStar, '.*');

        try {
            reg = new RegExp('^' + route + '$', options.isIgnoreCase ? 'i' : '');
        } catch (err) {
            return ret;
        }

        while ((matched = regColon.exec(routeSource)) !== null) {
            keys.push(matched[1]);
        }

        matched = hashbangString.match(reg);

        if (!matched) {
            return ret;
        }

        ret = {};

        dato.each(keys, function (index, key) {
            if (index && matched[index]) {
                ret[key] = matched[index];
            }
        });

        return ret;
    };

    /**
     * 监听 hashbang
     * @param {String} part 监听部分，可以为`query`或`path`
     * @param {String|Number|Array|Function} [key] 监听的键，`query`为字符串，`path`为数值，多个键使用数组表示
     * @param {Function} listener 监听回调
     *
     * @example
     * // pathc
     * hashbang.on('path', fn);
     * hashbang.on('path', 0, fn);
     *
     * // query
     * hashbang.on('query', fn);
     * hashbang.on('query', 'abc', fn);
     */
    exports.on = function (part, key, listener) {
        if (!_isSafePart(part)) {
            throw new Error('hashbang `part` must be `path` or `query`');
        }

        var args = allocation.args(arguments);
        var argL = args.length;
        var listenerMap;

        if (argL === 2) {
            listener = args[1];

            if (typeis(listener) === 'function') {
                if (part === 'query') {
                    queryAllListener.push(listener);
                } else {
                    pathAllListener.push(listener);
                }
            }
        } else if (argL === 3) {
            listenerMap = part === 'query' ? queryListenerMap : pathListenerMap;

            if (typeis(key) !== 'array') {
                key = [key];
            }

            dato.each(key, function (index, k) {
                listenerMap[k] = listenerMap[k] || [];

                if (typeis(listener) === 'function') {
                    listenerMap[k].push(listener);
                }
            });
        }
    };


    /**
     * 主动触发 hashchange 回调，
     * 但不能真实触发 window 的 hashchange 事件，
     * 防止影响其他监听
     * 通常用于页面初始化的时候触发，以匹配当前路由
     */
    exports.emit = function () {
        hashchangeCallback({
            newURL: location.href,
            oldURL: ''
        });
    };


    /**
     * 移除监听 hashbang
     * @param {String} part 监听部分，可以为`query`或`path`
     * @param {String|Number|Array|Function} [key] 监听的键，`query`为字符串，`path`为数值，多个键使用数组表示
     * @param {Function} [listener] 监听回调，回调为空表示删除该键的所有监听队列
     *
     * @example
     * // path
     * // 移除 path 0字段上的一个监听
     * hashbang.un('path', 0, fn);
     * // 移除 path 0字段上的所有监听
     * hashbang.un('path', 0);
     * // 移除 path 所有字段的一个监听
     * hashbang.un('path', fn);
     * // 移除 path 所有字段的所有监听
     * hashbang.un('path');
     *
     * // query
     * // 移除 query abc 键上的一个监听
     * hashbang.un('query', 'abc', fn);
     * // 移除 query abc 键上的所有监听
     * hashbang.un('query', 'abc');
     * // 移除 query 所有键上的一个监听
     * hashbang.un('query', fn);
     * // 移除 query 所有键上的所有监听
     * hashbang.un('query');
     */
    exports.un = function (part, key, listener) {
        if (!_isSafePart(part)) {
            throw new Error('hashbang `part` must be `path` or `query`');
        }

        var args = allocation.args(arguments);
        var argL = args.length;
        var findIndex;
        var arg1Type = typeis(args[1]);
        var arg2Type = typeis(args[2]);
        var listenerMap = part === 'query' ? queryListenerMap : pathListenerMap;

        if (argL === 1) {
            if (part === 'query') {
                queryAllListener = [];
            } else {
                pathAllListener = [];
            }
        } else if (argL === 2 && arg1Type === 'function') {
            listener = args[1];
            listenerMap = part === 'query' ? queryAllListener : pathAllListener;

            findIndex = listenerMap.indexOf(listener);

            if (findIndex > -1) {
                listenerMap.splice(findIndex, 1);
            }
        } else if (argL === 2 && (arg1Type === 'string' || arg1Type === 'array')) {
            key = arg1Type === 'array' ? key : [key];

            dato.each(key, function (index, k) {
                listenerMap[k] = [];
            });
        } else if (argL === 3 && (arg1Type === 'string' || arg1Type === 'array') && arg2Type === 'function') {
            key = arg1Type === 'array' ? key : [key];

            dato.each(key, function (index, k) {
                var findIndex = listenerMap.indexOf(listener);

                if (findIndex > -1) {
                    listenerMap[k].splice(findIndex, 1);
                }
            });
        }
    };

    event.on(window, 'hashchange', hashchangeCallback);


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
});