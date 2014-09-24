/*!
 * hashbang.js
 * @author ydr.me
 * 2014-09-24 14:50
 */


define(function (require, exports, module) {
    /**
     * @module util/hashbang
     */
    'use strict';

    var regHash = /#.*$/;
    var regHashbang = /^#!\//;
    var regColon = /:([^\/]+)/g;
    var regEndSlash = /\/$/;
    var regSep = /\//g;
    var data = require('./data.js');
    var qs = require('./querystring.js');
    var event = require('../core/event/event.js');
    var pathListenerMap = {};
    var queryListenerMap = {};
    var matchesDefaults = {
        // 是否忽略大小写，默认 false
        isIgnoreCase: !1,
        // 是否忽略末尾斜杠，默认 true
        isIgnoreEndSlash: !0
    };
    var hashbang = module.exports = {
        /**
         * 解析 hashbang 字符串为对象
         * @param {String} hashbangString 原始字符串或URL
         * @param {String} [sep] query 部分分隔符，默认`&`
         * @param {String} [eq] query 部分等于符，默认`=`
         * @returns {Object} 包含`path`和`query`两个字段
         */
        parse: function parse(hashbangString, sep, eq) {
            if (data.type(hashbangString) !== 'string') {
                return {};
            }

            hashbangString = (hashbangString.match(regHash) || [''])[0];

            if (!regHashbang.test(hashbangString)) {
                return {};
            }

            sep = sep || '&';
            eq = eq || '=';

            // #!/a/b/c/d/?a=1&b=2&c=3
            var hashbangGroup = hashbangString.replace(regHashbang, '/').split('#')[0];
            var hashGroup = hashbangGroup.split('?');
            var hashPathStack = [];

            data.each(hashGroup[0].split('/'), function (index, item) {
                item = _decode(item);
                if (item.length) {
                    hashPathStack.push(_decode(item));
                }
            });

            return {
                path: hashPathStack,
                query: qs.parse(hashGroup[1], sep, eq)
            };
        },

        /**
         * 将 hashbang 对象字符化
         * @param {Object} hashbangObject 对象，包含`path`和`query`两个字段
         * @param {String} [sep] query 部分分隔符，默认`&`
         * @param {String} [eq] query 部分等于符，默认`=`
         * @returns {string} hashbang 字符串
         */
        stringify: function (hashbangObject, sep, eq) {
            sep = sep || '&';
            eq = eq || '=';
            hashbangObject.path = hashbangObject.path || [];
            hashbangObject.query = hashbangObject.query || {};

            var hashPath = [];
            var hashQuerystring = qs.stringify(hashbangObject.query, sep, eq);

            data.each(hashbangObject.path, function (index, path) {
                hashPath.push(_encode(path));
            });

            return '#!' + (hashPath.length ? '/' + hashPath.join('/') : '') + '/' + (hashQuerystring ? '?' + hashQuerystring : '');
        },

        /**
         * 匹配 URL path 部分
         * @param {String} hashbangString hash 字符串
         * @param {String} regexp 正怎字符串
         * @param {Object} [options] 参数配置
         * @returns {*}
         */
        matches: function matches(hashbangString, regexp, options) {
            // /id/:id/ => /id/abc123/   √

            options = data.extend({}, matchesDefaults, options);

            var keys = [0];
            var matched;
            var regSource = regexp;
            var reg;
            var ret = null;

            if (data.type(hashbangString) !== 'string') {
                return ret;
            }

            hashbangString = '/' + hashbangString.replace(regHashbang, '').split('?')[0];


            if (options.isIgnoreEndSlash) {
                regexp += regEndSlash.test(regexp) ? '?' : '/?';
            }

            regexp = regexp.replace(regColon, '([^/]+)').replace(regSep, '\\/');
            reg = new RegExp('^' + regexp + '$', options.isIgnoreCase ? 'i' : '');

            while ((matched = regColon.exec(regSource)) !== null) {
                keys.push(matched[1]);
            }

            matched = hashbangString.match(reg);

            if (!matched) {
                return ret;
            }

            data.each(keys, function (index, key) {
                if (index && matched[index]) {
                    ret = ret || {};
                    ret[key] = matched[index];
                }
            });

            return ret;
        },

        /**
         * 监听 hashbang
         * @param {String} part 监听部分，可以为`query`或`path`
         * @param {String|Number|Array} key 监听的键，`query`为字符串，`path`为数值，多个键使用数组表示
         * @param {Function} listener 监听回调
         */
        on: function on(part, key, listener) {
            if (data.type(key) !== 'array') {
                key = [key];
            }

            var listenerMap = part === 'query' ? queryListenerMap : pathListenerMap;

            data.each(key, function (index, k) {
                listenerMap[k] = listenerMap[k] || [];

                if (data.type(listener) === 'function') {
                    listenerMap[k].push(listener);
                }
            });
        },

        /**
         * 移除监听 hashbang
         * @param {String} part 监听部分，可以为`query`或`path`
         * @param {String|Number|Array} key 监听的键，`query`为字符串，`path`为数值，多个键使用数组表示
         * @param {Function} [listener] 监听回调，回调为空表示删除该键的所有监听队列
         */
        un: function un(part, key, listener) {
            if (data.type(key) !== 'array') {
                key = [key];
            }

            var argsL = arguments.length;
            var listenerMap = part === 'query' ? queryListenerMap : pathListenerMap;

            data.each(key, function (i, k) {
                if (argsL === 1) {
                    delete(listenerMap[k]);
                } else {
                    data.each(listenerMap[k], function (j, _listener) {
                        if (listener === _listener) {
                            listenerMap[k].splice(j, 1);
                            return !1;
                        }
                    });
                }
            });
        }
    };


    event.on(window, 'hashchange', function (eve) {
        var newObject = hashbang.parse(eve.newURL);
        var oldObject = hashbang.parse(eve.oldURL);
        var pathDifferentKeys = _differentKeys(newObject.path, oldObject.path);
        var queryDifferentKeys = _differentKeys(newObject.query, oldObject.query);

        data.each(pathDifferentKeys, function (index, key) {
            if (pathListenerMap[key]) {
                data.each(pathListenerMap[key], function (j, listener) {
                    listener(eve, newObject, oldObject);
                });
            }
        });

        data.each(queryDifferentKeys, function (index, key) {
            if (queryListenerMap[key]) {
                data.each(queryListenerMap[key], function (j, listener) {
                    listener(eve, newObject, oldObject);
                });
            }
        });
    });


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
     * 比较两个对象的一级键值，返回不全等值的键
     * @param {Object} obj1 对象1
     * @param {Object} obj2 对象2
     * @returns {Array}
     * @private
     */
    function _differentKeys(obj1, obj2) {
        var keys = [];

        data.each(obj1, function (key, val) {
            if (val !== obj2[key]) {
                keys.push(key);
            }
        });

        data.each(obj2, function (key, val) {
            if (val !== obj1[key] && keys.indexOf(key) === -1) {
                keys.push(key);
            }
        });

        return keys;
    }
});