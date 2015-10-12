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
     */
    'use strict';

    var allocation = require('./allocation.js');
    var dato = require('./dato.js');
    var typeis = require('./typeis.js');
    var qs = require('./querystring.js');
    var regHash = /#.*$/;
    var regHashbang = /^#!\//;
    var regColon = /:(\w+\b)/g;
    var regStar = /\*/g;
    var regEndSlash = /\/$/;
    var regSep = /\//g;
    var matchesDefaults = {
        // 是否忽略大小写，默认 false
        ignoreCase: false,
        // 是否严格模式，默认 false，即默认忽略末尾“/”
        strict: false
    };


    /**
     * 解析 hashbang 字符串为对象
     * @static
     * @param {String} hashbangString 原始字符串或URL
     * @param {String} [sep] query 部分分隔符，默认`&`
     * @param {String} [eq] query 部分等于符，默认`=`
     * @returns {Object} 解析结果
     *
     * @example
     * hashbang.parse('#!/a/b/c?a=1&b=2');
     * // =>
     * // {
     * //    path: ["a", "b", "c"],
     * //    query: {
     * //        a: "1",
     * //        b: "2"
     * //    },
     * //    pathstring: '/a/b/c',
     * //    querystring: 'a=1&b=2',
     * //    uri: '/a/b/c?a=1&b=2'
     * // }
     */
    exports.parse = function (hashbangString, sep, eq) {
        var dftRet = {path: [], query: {}, pathstring: '', querystring: '', uri: ''};

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
            query: qs.parse(hashGroup[1], sep, eq),
            pathstring: hashGroup[0],
            querystring: hashGroup[1],
            uri: hashGroup[0] + (hashGroup[1] ? '?' : '') + (hashGroup[1] || '')
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
     * @param {String} routeRule 路由规则
     * @param {Object} [options] 参数配置
     * @param {Object} [options.ignoreCase] 是否忽略大小写，默认 false
     * @param {Object} [options.strict] 是否忽略末尾斜杠，默认 true
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
    exports.matches = function (hashbangString, routeRule, options) {
        // /id/:id/ => /id/abc123/   √

        options = dato.extend({}, matchesDefaults, options);

        var temp;
        var keys = [0];
        var matched;
        var routeRuleOrigin = routeRule;
        var reg;
        var ret = null;

        if (typeis(hashbangString) !== 'string') {
            return ret;
        }

        temp = hashbangString.split('#');
        temp.shift();

        if (temp.length) {
            hashbangString = '#' + temp.join('');
            hashbangString = '/' + hashbangString.replace(regHashbang, '').split('?')[0];
        } else {
            hashbangString = '/';
        }

        if (!options.strict) {
            routeRule += regEndSlash.test(routeRule) ? '?' : '/?';
        }

        routeRule = routeRule
            .replace(regColon, (options.strict ? '?' : '') + '([^/]+)')
            .replace(regSep, '\\/')
            .replace(regStar, '.*');

        try {
            reg = new RegExp('^' + routeRule + '$', options.ignoreCase ? 'i' : '');
        } catch (err) {
            return ret;
        }

        while ((matched = regColon.exec(routeRuleOrigin)) !== null) {
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