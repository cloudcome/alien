/*!
 * xhr.js
 * @author ydr.me
 * 2014-09-23 22:14
 */


define(function (require, exports, module) {
    /**
     * @module core/communication/xhr
     * @requires util/typeis
     * @requires util/dato
     * @requires util/class
     * @requires util/querystring
     * @requires libs/Emitter
     */
    'use strict';

    var typeis = require('../../util/typeis.js');
    var dato = require('../../util/dato.js');
    var klass = require('../../util/class.js');
    var qs = require('../../util/querystring.js');
    var Emitter = require('../../libs/Emitter.js');
    var regCache = /\b_=[^&]*&?/;
    var regEnd = /[?&]$/;
    var REG_DOMAIN = /^([\w-]+:)?\/\/([^\/]+)/;
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
        data: null,
        // 请求头
        headers: null,
        // 是否异步
        isAsync: true,
        // 是否保留缓存
        isCache: false,
        // 是否进行跨域请求，Cross-Origin Resource Sharing
        // http://www.w3.org/TR/cors/
        isCORS: false,
        // 请求鉴权用户名
        username: null,
        // 请求鉴权密码
        password: null,
        // 覆盖 MIME
        mimeType: null
    };
    var regProtocol = /^([\w-]+:)\/\//;
    var XHR = klass.create({
        STATIC: {},
        constructor: function (options) {
            var the = this;

            Emitter.apply(the);

            options = dato.extend(!0, {}, defaults, options);

            var requestDomain = (options.url.match(REG_DOMAIN) || ['', '', ''])[2];
            var hasCrossDomain = requestDomain && requestDomain !== window.location.host;

            if (!options.headers) {
                options.headers = {};
            }

            if (!options.headers['x-request-with'] && !hasCrossDomain) {
                options.headers['x-request-with'] = 'XMLHttpRequest';
            }

            options.method = options.method.toUpperCase();

            var xhr = new XMLHttpRequest();
            var protocol = (options.url.match(regProtocol) || ['', location.protocol])[1];
            var oncallback = function (err, ret) {
                if(err){
                    err.message = err.message || 'network error';
                }

                the.emit('complete', err, ret);

                if (err) {
                    the.emit('error', err);
                } else {
                    the.emit('success', ret);
                }

                the.emit('finish', err, ret);
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
                    oncallback(new Error('response status is ' + xhr.status));
                }
            };

            xhr.onabort = function () {
                oncallback(new Error('transmission has aborted'));
            };

            xhr.ontimeout = function () {
                oncallback(new Error('transmission has timeout'));
            };

            xhr.onerror = oncallback;

            xhr.upload.onprogress = function (eve) {
                eve.alienDetail = eve.alienDetail || {};
                eve.alienDetail.complete = 0;
                eve.alienDetail.percent = '0%';

                if (eve.lengthComputable) {
                    eve.alienDetail.complete = eve.loaded / eve.total;
                    eve.alienDetail.percent = (eve.alienDetail.complete * 100) + '%';
                }

                the.emit(xhr, 'progress', eve);
            };

            xhr.open(options.method, _buildURL(options), options.isAsync, options.username, options.password);

            if (options.isCORS) {
                xhr.withCredentials = true;
            }

            if (options.mimeType) {
                xhr.overrideMimeType(options.mimeType);
            }

            // 当 data 为 formdata 时，删除 content-type header
            if(options.data && options.data.constructor === FormData){
                delete options.headers['content-type'];
            }

            dato.each(options.headers, function (key, val) {
                xhr.setRequestHeader(key, val);
            });
            xhr.send(_buildData(options));

            the.xhr = xhr;
            return the;
        },
        abort: function () {
            var the = this;

            the.xhr.abort();

            return the;
        }
    }, Emitter);


    module.exports = {
        /**
         * ajax 请求
         * @param {Object} [options] 配置参数
         * @param {String} [options.url] 请求地址
         * @param {String} [options.method] 请求方法，默认 GET
         * @param {Object} [options.headers] 请求头
         * @param {String} [options.type=json] 数据类型，默认 json
         * @param {String|Object} [options.query] URL querstring
         * @param {*} [options.data] 请求数据
         * @param {Boolean} [options.isAsync] 是否异步，默认 true
         * @param {Boolean} [options.isCache] 是否保留缓存，默认 false
         * @param {String} [options.username] 请求鉴权用户名
         * @param {String} [options.password] 请求鉴权密码
         *
         * @example
         * xhr.ajax().on('success', fn).on('error', fn);
         */
        ajax: function (options) {
            return new XHR(options);
        },
        /**
         * ajax GET 请求
         * @param url {String} 请求地址
         * @param query {String|Object} 请求参数
         * @returns {*}
         */
        get: function (url, query) {
            return this.ajax({
                method: 'GET',
                url: url,
                query: query
            });
        },
        post: function (url, data) {
            return this.ajax({
                method: 'POST',
                url: url,
                data: data
            });
        }
    };


    /**
     * 构建 URL
     * @param {Object} options 配置参数
     * @returns {string}
     * @private
     */
    function _buildURL(options) {
        var url = options.url;
        var query = options.query;
        var querystring = typeis.string(query) === 'string' ? query : qs.stringify(query);
        var cache = options.isCache ? '' : '_=' + Date.now();

        // 删除原有的缓存字符串
        url = options.isCache ? url : url.replace(regCache, '').replace(regEnd, '');

        return (url +
        (url.indexOf('?') > -1 ? '&' : '?') +
        cache +
        (cache ? '&' : '') +
        querystring).replace(regEnd, '');
    }


    /**
     * 构建传输数据
     * @param options
     * @returns {*}
     * @private
     */
    function _buildData(options) {
        if (options.method === 'GET') {
            return null;
        }

        return options.data;
    }
});