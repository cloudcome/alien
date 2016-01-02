/*!
 * xhr.js
 * @author ydr.me
 * 2014-09-23 22:14
 */


define(function (require, exports, module) {
    /**
     * @module core/communication/xhr
     * @requires utils/typeis
     * @requires utils/dato
     * @requires utils/number
     * @requires utils/class
     * @requires utils/querystring
     * @requires libs/emitter
     */
    'use strict';

    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var number = require('../../utils/number.js');
    var klass = require('../../utils/class.js');
    var urlUtils = require('../../utils/url.js');
    var qs = require('../../utils/querystring.js');
    var Emitter = require('../../libs/emitter.js');
    var REG_DOMAIN = /^([\w-]+:)?\/\/([^\/]+)/;
    var regProtocol = /^([\w-]+:)\/\//;
    var contentTypeMap = {
        json: 'application/json',
        urlencoded: 'application/x-www-form-urlencoded',
        //formData: 'multipart/form-data',
        text: 'plain',
        plain: 'plain'
    };
    var defaults = {
        // 请求地址
        url: location.href,
        // 请求方式
        method: 'GET',
        // 响应数据类型：json、text
        type: 'json',
        // 请求 querystring
        query: {},
        // 请求数据
        body: null,
        // 请求头
        headers: null,
        // 是否异步
        async: true,
        // 是否保留缓存
        cache: false,
        // 是否进行跨域请求，Cross-Origin Resource Sharing
        // http://www.w3.org/TR/cors/
        isCORS: false,
        // 请求鉴权用户名
        username: null,
        // 请求鉴权密码
        password: null,
        // 覆盖 MIME
        mimeType: null,
        // 延时请求时间
        delay: 0,
        // 请求超时时间，10秒
        timeout: 10000
    };
    var XHR = klass.extends(Emitter).create({
        constructor: function (options) {
            var the = this;

            options = dato.extend(true, {}, defaults, options);

            var requestDomain = (options.url.match(REG_DOMAIN) || ['', '', ''])[2];
            var hasCrossDomain = requestDomain && requestDomain !== window.location.host;

            if (!options.headers) {
                options.headers = {};
            }

            if (!options.headers['x-requested-with'] && !hasCrossDomain) {
                options.headers['x-requested-with'] = 'XMLHttpRequest';
            }

            options.method = options.method.toUpperCase();

            var xhr = new XMLHttpRequest();
            var protocol = (options.url.match(regProtocol) || ['', location.protocol])[1];
            the._hasCallback = false;
            var oncallback = function (err, ret) {
                if (the._hasCallback) {
                    return;
                }

                the._hasCallback = true;

                if (err) {
                    err.message = err.message || 'network error';
                }

                setTimeout(function () {
                    if (lastProgressEvent) {
                        lastProgressEvent.alienDetail.complete = 1;
                        lastProgressEvent.alienDetail.percent = '100%';
                        the.emit('progress', lastProgressEvent);
                    }

                    the.emit('complete', err, ret);

                    if (err) {
                        the.emit('error', err);
                    } else {
                        the.emit('success', ret);
                    }

                    the.emit('finish', err, ret);
                }, options.delay);
            };

            xhr.onload = function () {
                var responseText = xhr.responseText;
                var json;
                var err;

                // 200 - 300
                if ((xhr.status >= 200 && xhr.status < 300) ||
                        // 304
                    xhr.status === 304 ||
                        // file
                    (xhr.status === 0 && protocol === 'file:')) {
                    switch (options.type) {
                        case 'json':
                            try {
                                json = JSON.parse(responseText);
                            } catch (_err) {
                                err = _err;
                            }

                            oncallback(err, json);
                            break;

                        default:
                            oncallback(null, responseText);
                    }
                } else {
                    oncallback(new Error(xhr.statusText || 'response status is ' + xhr.status));
                }
            };

            //xhr.onabort = function () {
            //    var err = new Error('transmission has aborted');
            //
            //    err.type = 'abort';
            //    oncallback(err);
            //};
            //
            //xhr.ontimeout = function () {
            //    var err = new Error('transmission has timeout');
            //
            //    err.type = 'timeout';
            //    oncallback(err);
            //};

            xhr.onerror = oncallback;

            var lastProgressEvent;

            xhr.upload.onprogress = function (eve) {
                eve.alienDetail = eve.alienDetail || {};
                eve.alienDetail.complete = 0;
                eve.alienDetail.percent = '0%';

                if (eve.lengthComputable) {
                    eve.alienDetail.loaded = eve.loaded;
                    eve.alienDetail.total = eve.total;
                    eve.alienDetail.complete = eve.loaded / eve.total;

                    var percent = eve.alienDetail.complete * 100;

                    if (percent >= 100) {
                        eve.alienDetail.complete = 0.99;
                        percent = 99;
                    }

                    // 最多小数点2位
                    percent = number.parseFloat(percent).toFixed(2);
                    eve.alienDetail.percent = percent + '%';
                }

                the.emit('progress', eve);
                lastProgressEvent = eve;
            };

            xhr.open(options.method, _buildURL(options), options.async, options.username, options.password);

            if (options.isCORS) {
                xhr.withCredentials = true;
            }

            var contentType = contentTypeMap[options.type];

            if (options.mimeType) {
                xhr.overrideMimeType(options.mimeType);
            } else if (contentType) {
                // 复写响应 content-type
                xhr.overrideMimeType(contentType);
            }

            // 当 body 为 FormData 时，删除 content-type header
            if (options.body && options.body.constructor === FormData) {
                delete options.headers['content-type'];
            }

            dato.each(options.headers, function (key, val) {
                xhr.setRequestHeader(key, val);
            });
            xhr.send(_buildBody(options));

            if (options.timeout) {
                the._timer = setTimeout(function () {
                    the.abort();
                }, options.timeout);
            }

            the.xhr = xhr;
            return the;
        },

        /**
         * 中断当前请求
         * @returns {XHR}
         */
        abort: function () {
            var the = this;

            try {
                the.xhr.abort();
            } catch (err) {
                // ignore
            }

            return the;
        }
    });


    /**
     * 异步请求
     * @param {Object} [options] 配置参数
     * @param {String} [options.url] 请求地址
     * @param {String} [options.method] 请求方法，默认 GET
     * @param {Object} [options.headers] 请求头
     * @param {String} [options.type=json] 数据类型，默认 json
     * @param {String|Object} [options.query] URL querstring
     * @param {*} [options.body] 请求数据
     * @param {Boolean} [options.isAsync] 是否异步，默认 true
     * @param {Boolean} [options.isCache] 是否保留缓存，默认 false
     * @param {String} [options.username] 请求鉴权用户名
     * @param {String} [options.password] 请求鉴权密码
     * @param {String|null} [options.mimeType=null] 覆盖 MIME
     * @param {Number} [options.delay=0] 请求延迟时间
     *
     * @example
     * xhr().on('success', fn).on('error', fn);
     */
    var xhr = function (options) {
        return new XHR(options);
    };


    /**
     * ajax 请求
     * @param {Object} [options] 配置参数
     * @param {String} [options.url] 请求地址
     * @param {String} [options.method] 请求方法，默认 GET
     * @param {Object} [options.headers] 请求头
     * @param {String} [options.type=json] 数据类型，默认 json
     * @param {String|Object} [options.query] URL querstring
     * @param {*} [options.body] 请求数据
     * @param {Boolean} [options.async] 是否异步，默认 true
     * @param {Boolean} [options.cache] 是否保留缓存，默认 false
     * @param {String} [options.username] 请求鉴权用户名
     * @param {String} [options.password] 请求鉴权密码
     * @param {String|null} [options.mimeType=null] 覆盖 MIME
     * @param {Number} [options.delay=0] 请求延迟时间
     *
     * @example
     * xhr.ajax().on('success', fn).on('error', fn);
     */
    xhr.ajax = function (options) {
        return new XHR(options);
    };


    /**
     * ajax GET 请求
     * @param url {String} 请求地址
     * @param [query] {String|Object} 请求参数
     * @returns {*}
     */
    xhr.get = function (url, query) {
        return this.ajax({
            method: 'GET',
            url: url,
            query: query
        });
    };


    /**
     * ajax POST 请求
     * @param url {String} 请求地址
     * @param body {String|Object} 请求数据
     * @returns {*}
     */
    xhr.post = function (url, body) {
        return this.ajax({
            method: 'POST',
            url: url,
            body: body
        });
    };


    module.exports = xhr;


    /**
     * 构建 URL
     * @param {Object} options 配置参数
     * @returns {string}
     * @private
     */
    function _buildURL(options) {
        var ret = urlUtils.parse(options.url);
        var query = options.query;
        var cacheKey = '_';

        if (typeis.string(query)) {
            query = qs.parse(query);
        }

        dato.extend(ret.query, query);

        if (!options.cache) {
            while (ret.query[cacheKey]) {
                cacheKey += '_';
            }

            ret.query[cacheKey] = Date.now();
        }

        return ret.base + '?' + qs.stringify(ret.query);
    }


    /**
     * 构建传输数据
     * @param options
     * @returns {*}
     * @private
     */
    function _buildBody(options) {
        if (options.method === 'GET') {
            return null;
        }

        return options.body;
    }
});