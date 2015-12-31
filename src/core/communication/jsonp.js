/*!
 * jsonp.js
 * @author ydr.me
 * @create 2014-10-06 22:47
 */


define(function (require, exports, module) {
    /**
     * @module core/communication/jsonp
     * @requires utils/dato
     * @requires utils/class
     * @requires libs/emitter
     * @requires utils/querystring
     * @requires core/dom/modification
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var klass = require('../../utils/class.js');
    var random = require('../../utils/random.js');
    var Emitter = require('../../libs/emitter.js');
    var qs = require('../../utils/querystring.js');
    var modification = require('../../core/dom/modification.js');
    var defaults = {
        // 可选 var 和 function
        type: 'function',
        // 请求地址
        url: null,
        // 请求参数
        query: null,
        // 是否保留缓存
        isCache: false
    };
    var regQ = /\?$/;
    var $container = document.body || document.documentElement;
    var JSONP = klass.extends(Emitter).create(function (options) {
        var the = this;

        options = dato.extend(true, {}, defaults, options);

        options.url = String(options.url);

        if (!options.url || !regQ.test(options.url)) {
            throw new Error('json url must be end of `?`');
        }

        options.query = options.query || {};

        if (!options.isCache) {
            options.query._ = Date.now();
        }

        var name = 'alienJSONP' + random.string(9, 'aA0_') + Date.now();
        var qss = qs.stringify(options.query);
        var $script = modification.create('script', {
            async: 'async',
            src: options.url.replace(regQ, name) + (qss ? '&' + qss : '')
        });

        if (options.type === 'function') {
            window[name] = function (dt) {
                the.emit('complete', null, dt);
                the.emit('success', dt);
                the.emit('finish', null, dt);
                delete(window[name]);
                modification.remove($script);
            };
        } else {
            window[name] = null;
        }

        $script.onerror = function (err) {
            the.emit('complete', err);
            the.emit('error', err);
            the.emit('finish', err);
            modification.remove($script);
        };

        $script.onload = function () {
            if (options.type === 'var') {
                the.emit('complete', null, window[name]);
                the.emit('success', window[name]);
                the.emit('finish', null, window[name]);
                window[name] = null;
                modification.remove($script);
            }
        };

        modification.insert($script, $container, 'beforeend');
    });

    exports.defaults = defaults;

    /**
     * 跨域 JSONP
     * @param {Object} options 配置
     * @param {String} [options.type="function"] 方式，分别为 var 或者 function
     * @param {String} options.url 请求地址，必须为`http://ydr.me/?callback=?`格式，与 jquery 一致
     * @param {Object|null} [options.query=null] 请求参数
     * @param {Boolean} [options.isCache=false] 是否保留缓存，默认 false
     *
     * @example
     * jsonp(options).on('success', fn).on('error', fn);
     */
    module.exports = function (options) {
        return new JSONP(options);
    };
});