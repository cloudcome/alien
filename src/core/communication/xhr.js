/*!
 * xhr.js
 * @author ydr.me
 * 2014-09-23 22:14
 */


define(function (require, exports, module) {
    /**
     * @module core/communication/xhr
     * @requires util/data
     * @requires core/navigator/querystring
     */
    'use strict';

    var data = require('../../util/data.js');
    var qs = require('../navigator/querystring.js');
    var regCache = /\b_=[^&]*&?/;
    var regEnd = /[?&]$/;
    var noop = function () {

    };
    var defaults = {
        // 请求地址
        url: location.href,
        // 请求方式
        method: 'GET',
        // 响应数据类型：json、text
        type: 'json',
        // 请求 querystring
        query: null,
        // 请求数据
        data: null,
        // 请求头
        headers: null,
        // 是否异步
        isAsync: !0,
        // 是否保留缓存
        isCache: !1,
        // 请求鉴权用户名
        username: null,
        // 请求鉴权密码
        password: null,
        // 请求成功回调
        // this：xhr
        // 参数1：响应结果
        onload: noop,
        // 请求失败回调
        // this：xhr
        // 参数1：错误对象
        onerror: noop,
        // 请求进度回调，常用于上传文件
        // this：xhr
        // 参数1：event
        // 参数2：当前百分比
        onprogress: noop
    };

    module.exports = {
        /**
         * ajax 请求
         * @param {Object} [options] 配置参数
         * @param {String} [options.url] 请求地址
         * @param {String} [options.method] 请求方法，默认 GET
         * @param {String} [options.type] 数据类型，默认 json
         * @param {String|Object} [options.query] URL querstring
         * @param {*} [options.data] 请求数据
         * @param {Boolean} [options.isAsync] 是否异步，默认 true
         * @param {Boolean} [options.isCache] 是否保留缓存，默认 false
         * @param {String} [options.username] 请求鉴权用户名
         * @param {String} [options.password] 请求鉴权密码
         * @param {Function(this:XMLHttpRequest, event)} [options.onload] 请求并处理成功
         * @param {Function(this:XMLHttpRequest, event)} [options.onerror] 请求失败或处理失败
         * @param {Function(this:XMLHttpRequest, event, percent)} [options.onprogress] 上传进度回调
         * @returns {XMLHttpRequest}
         */
        ajax: function (options) {
            options = data.extend(!0, {}, defaults, options);

            if (!options.headers) {
                options.headers = {};
            }

            options.headers['X-Requested-With'] = 'XMLHttpRequest';
            options.method = options.method.toUpperCase();

            var xhr = new XMLHttpRequest();

            xhr.onload = function () {
                var responseText = xhr.responseText;
                var json;

                if (xhr.status > 399 && xhr.status < 600) {
                    switch (options.type) {
                        case 'json':
                            try {
                                json = JSON.parse(responseText);
                            } catch (err) {
                                options.onerror.call(xhr, err);
                            }
                            break;

                        default:
                            options.onload.call(xhr, responseText);
                            break;
                    }
                } else {
                    options.onerror.call(xhr, new Error('transmission status error'));
                }
            };

            xhr.onabort = function () {
                options.onerror.call(xhr, new Error('transmission is aborted'));
            };

            xhr.ontimeout = function () {
                options.onerror.call(xhr, new Error('transmission has expired'));
            };

            xhr.onerror = function (err) {
                options.onerror.call(xhr, err);
            };

            xhr.upload.onprogress = function (eve) {
                if (eve.lengthComputable) {
                    eve.detail = eve.detail || {};
                    eve.detail.complete = (eve.loaded / eve.total * 100 | 0)+'%';
                }

                options.onprogress.call(xhr, eve);
            };

            xhr.open(options.method, _buildURL(options), options.isAsync, options.username, options.password);
            data.each(options.headers, function (key, val) {
                xhr.setRequestHeader(key, val);
            });
            xhr.send(_buildData(options));

            return xhr;
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
        var query = options.url;
        var querystring = data.type(query) === 'string' ? query : qs.stringify(query);
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