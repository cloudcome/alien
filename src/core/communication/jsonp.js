/*!
 * jsonp.js
 * @author ydr.me
 * @create 2014-10-06 22:47
 */


define(function (require, exports, module) {
    /**
     * @module core/communication/jsonp
     */
    'use strict';

    var data = require('../../util/data.js');
    var Deferred = require('../../libs/Deferred.js');
    var qs = require('../navigator/querystring.js');
    var modification = require('../../core/dom/modification.js');
    var defaults = {
        // 可选 var 和 function
        type: 'function',
        // 请求地址
        url: null,
        // 请求参数
        query: null,
        // 是否保留缓存
        isCache: !1
    };
    var regQ = /\?$/;
    var index = 0;

    exports.defaults = defaults;

    /**
     * 跨域 JSONP
     * @param {Object} options 配置
     * @param {String} [options.type="function"] 方式，分别为 var 或者 function
     * @param {String} options.url 请求地址，必须为`http://ydr.me/?callback=?`格式，与jquery 一致
     * @param {Object|null} [options.query=null] 请求参数
     * @param {Boolean} [options.isCache=false] 是否保留缓存，默认 false
     * @returns {Deferred} 返回 Deferred 实例
     *
     * @example
     * jsonp(options);
     */
    module.exports = function (options) {
        options = data.extend(!0, {}, defaults, options);

        options.url = String(options.url);

        if (!options.url || !regQ.test(options.url)) {
            throw new Error('json url must be end of `?`');
        }

        options.query = options.query || {};

        if (!options.isCache) {
            options.query._ = ++index;
        }

        var name = 'alienJSONP' + Date.now() + String(Math.random()).slice(2);
        var qss = qs.stringify(options.query);
        var script = modification.create('script', {
            async: 'async',
            src: options.url.replace(regQ, name) + (qss ? '&' + qss : '')
        });
        var df = new Deferred();

        if (options.type === 'function') {
            window[name] = function (dt) {
                if (data.type(options.onsuccess) === 'function') {
                    df.resolve(dt);
                }

                delete(window[name]);
                modification.remove(script);
            };
        } else {
            window[name] = null;
        }

        script.onerror = function (err) {
            df.reject(err);
            modification.remove(script);
        };

        script.onload = function () {
            if (options.type === 'var') {
                df.resolve(window[name]);
                window[name] = null;
                modification.remove(script);
            }
        };

        modification.insert(script, document.body, 'beforeend');
    };
});