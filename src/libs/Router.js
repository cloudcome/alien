/*!
 * 前端路由模块
 * @author ydr.me
 * @create 2015-03-28 17:50
 */


define(function (require, exports, module) {
    /**
     * @module libs/Router.js
     */
    'use strict';

    var Emitter = require('./Emitter.js');
    var event = require('../core/event/base.js');
    var klass = require('../utils/class.js');
    var typeis = require('../utils/typeis.js');
    var hashbang = require('../utils/hashbang.js');
    var dato = require('../utils/dato.js');
    var controller = require('../utils/controller.js');
    var alienIndex = 0;
    var defaults = {
        // 是否忽略大小写
        isIgnoreCase: false,
        // 是否忽略结尾斜杠
        isIgnoreEndSlash: true
    };
    var Router = klass.create(function (options) {
        var the = this;

        the._options = dato.extend({}, defaults, options);
        the._routerList = [];
        the._routerMap = {};
        the._unMatchedCallbackList = [];
        the._lastMatchedRoute = null;
        the._msgMap = {};
        //the._isIgnoreHashChange = false;
        //the._hashchangeTimes = 0;
        //the._ignoreHashchangeTimes = -1;
        the._initEvent();
    }, Emitter);

    Router.implement({
        _initEvent: function () {
            var the = this;

            the._onhashchange = function (eve) {
                var matched = null;
                var matchIndex = -1;
                var matchKey = '';
                var msgs;

                dato.each(the._routerList, function (index, routerConfig) {
                    matchKey = Object.keys(routerConfig)[0];
                    matched = hashbang.matches(eve.newURL, matchKey, the._options);
                    matchIndex = index;

                    if (matched) {
                        return false;
                    }
                });

                if (the._lastMatchedRoute !== null) {
                    the.emit('leave', the._lastMatchedRoute, matchKey);
                }

                if (matched && matchIndex > -1) {
                    the.emit('enter', matchKey, the._lastMatchedRoute);
                    msgs = the._msgMap[matchKey] || {};
                    dato.each(msgs, function (key, val) {
                        if (msgs[key]._receive) {
                            delete(msgs[key]);
                        } else {
                            msgs[key]._receive = true;
                        }
                    });
                    the._lastMatchedRoute = matchKey;
                    the._routerList[matchIndex][matchKey].forEach(function (callback) {
                        callback.call(the, matched, msgs);
                    });
                } else {
                    the._lastMatchedRoute = null;
                    the._unMatchedCallbackList.forEach(function (callback) {
                        callback.call(the, {});
                    });
                }
            };

            event.on(window, 'hashchange', the._onhashchange);
            controller.nextTick(function () {
                the._onhashchange({
                    newURL: location.href
                });
            });
        },


        /**
         * 添加路由
         * @param route {String} 路由表达式
         * @param callback {Function} 进入路由回调
         */
        if: function (route, callback) {
            var the = this;
            var map = {};
            var index = the._routerList.length;

            if (!typeis.function(callback)) {
                return the;
            }

            route = String(route);
            map[route] = [callback];

            // 存在路由
            if (typeis.undefined(the._routerMap[route])) {
                the._routerMap[route] = index;
                the._routerList.push(map);
            }
            // 不存在路由
            else {
                index = the._routerMap[route];
                the._routerList[index][route].push(callback);
            }

            return the;
        },


        /**
         * 未匹配路由
         * @param callback {Function} 回调
         */
        else: function (callback) {
            var the = this;

            if (typeis.function(callback)) {
                the._unMatchedCallbackList.push(callback);
            }

            return the;
        },


        /**
         * 路由跳转
         * @param url {String} 跳转的地址
         */
        redirect: function (url) {
            var the = this;

            location.hash = '#!' + url;

            return the;
        },


        /**
         * 向指定路由发送消息
         * @param route {String} 接收路由
         * @param name {String} 消息名称
         * @param body {*} 消息实体
         */
        send: function (route, name, body) {
            var the = this;
            var msg = {
                name: name,
                src: the._lastMatchedRoute,
                target: route,
                timeStamp: Date.now(),
                id: alienIndex++,
                body: body,
                _receive: false
            };

            if (!the._msgMap[route]) {
                the._msgMap[route] = {};
            }

            if (!the._msgMap[route][name]) {
                the._msgMap[route][name] = [];
            }

            the._msgMap[route][name] = msg;

            return the;
        }
    });

    module.exports = Router;
});