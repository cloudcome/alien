/*!
 * xhr.js
 * @author ydr.me
 * 2014-09-23 22:14
 */


define(function (require, exports, module) {
    /**
     * @module parent/child.js
     */
    'use strict';

    var data = require('../../util/data.js');
    var qs = require('../../util/querystring.js');
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
        ajax: function ajax(options) {
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

                switch(options.type){
                    case 'json':
                        try{
                            json = JSON.parse(responseText);
                        }catch(err){
                            options.onerror.call(xhr, err);
                        }
                       break;

                    default:
                        options.onload.call(xhr, responseText);
                        break;
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


    function _buildData(options) {
        if(options.method === 'GET'){
            return null;
        }

        return options.data;
    }
});