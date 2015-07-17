/*!
 * pushstate & ajax
 * @author ydr.me
 * @create 2014-11-15 12:21
 */


define(function (require, exports, module) {
    /**
     * @module libs/pjax
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/communication/xhr
     * @requires core/event/base
     * @requires utils/dato
     * @requires utils/class
     * @requires core/libs/emitter
     */
    'use strict';

    var selector = require('../core/dom/selector.js');
    var modification = require('../core/dom/modification.js');
    var attribute = require('../core/dom/attribute.js');
    var xhr = require('../core/communication/xhr.js');
    var event = require('../core/event/base.js');
    var dato = require('../utils/dato.js');
    var klass = require('../utils/class.js');
    var Emitter = require('./emitter.js');
    var history = window.history;
    var localStorage = window.localStorage;
    var defaults = {
        selector: 'a',
        // <a data-state='{"a":"1"}'>click me</a>
        stateData: 'state',
        // 缓存时间，单位毫秒（默认1天），为0时表示不缓存
        cacheExpires: 86400000,
        cacheKey: 'alien-libs-Pjax',
        ajax: {
            method: 'GET',
            dataType: 'text',
            headers: {
                'x-request-as': 'pjax'
            }
        }
    };
    var Pjax = klass.extends(Emitter).create({
        constructor: function ($container, options) {
            var the = this;

            the.$container = selector.query($container);

            if (!the.$container.length) {
                throw new Error('Pjax require $container element');
            }

            the.$container = the.$container[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },
        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._initEvent();
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;

            event.on(document, 'click', options.selector, function (eve) {
                var url = the._getURL(this);

                if (url !== the.url) {
                    the.url = url;
                    the.state = attribute.data(this, options.stateData);
                    history.pushState(the.state, null, the.url);
                    the._render();
                }

                eve.preventDefault();
            });

            event.on(window, 'popstate', function () {
                the.url = the._getURL(location);
                the.state = history.state;
                the._render();
            });
        },


        /**
         * 设置缓存
         * @param data
         * @private
         */
        _setCache: function (data) {
            var the = this;
            var key = the._options.cacheKey + the.url;
            var val = JSON.stringify({
                timeStamp: Date.now(),
                data: data
            });

            localStorage.setItem(key, val);
        },


        /**
         * 获取缓存
         * @returns {Object}
         * @private
         */
        _getCache: function () {
            var the = this;
            var key = the._options.cacheKey + the.url;

            try {
                return JSON.parse(localStorage.getItem(key));
            } catch (err) {
                return {};
            }
        },


        /**
         * 获取本域的 URL
         * @returns {string}
         * @private
         */
        _getURL: function (parent) {
            return parent.pathname + parent.search;
        },


        _ajax: function (callback) {
            var the = this;
            var options = the._options;

            if (the._xhr) {
                the._xhr.abort();
            }

            the._xhr = xhr.ajax(dato.extend(true, {}, options.ajax, {
                url: the.url
            })).on('success', function (html) {
                callback(true, html);
            }).on('error', function (err) {
                callback(false, err.message);
            });
        },


        /**
         * 渲染
         * @private
         */
        _render: function () {
            var the = this;
            var expires = the._options.cacheExpires;
            var cache = expires ? the._getCache() : null;
            var _render = function (isSuccess, html) {
                the._xhr = null;
                the.emit('afterchange');

                if (the.emit(isSuccess ? 'success' : 'error', html) !== false) {
                    the.$container.innerHTML = html;
                }
            };

            the.inCache = cache && Date.now() - cache.timeStamp < expires;
            the.emit('beforechange');

            // 有效期内
            if (the.inCache) {
                _render(true, cache.data);
            } else {
                the._ajax(function (isSuccess, html) {
                    _render(isSuccess, html);

                    // 设置缓存
                    if (expires && isSuccess) {
                        the._setCache(html);
                    }
                });
            }
        },


        /**
         * 主动跳转
         * @param url {String} 跳转地址
         * @param state {Object} 传递参数
         */
        redirect: function (url, state) {
            var the = this;

            the.url = url;
            the.state = state;
            history.pushState(state, null, url);
            the._render();
        }
    });

    Pjax.defaults = defaults;
    module.exports = Pjax;
});