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
        the._lastMatchedRouter = null;
        the._initEvent();
    }, Emitter);


    Router.fn._initEvent = function () {
        var the = this;

        the._onhashchange = function (eve) {
            var matched = null;
            var matchIndex = -1;
            var matchKey = '';

            dato.each(the._routerList, function (index, routerConfig) {
                matchKey = Object.keys(routerConfig);
                matched = hashbang.matches(eve.newURL, matchKey, the._options);
                matchIndex = index;

                if (matched) {
                    return false;
                }
            });

            if (the._lastMatchedRouter !== null) {
                the.emit('leave', the._lastMatchedRouter);
            }

            if (matched && matchIndex > -1) {
                the._lastMatchedRouter = matchKey;
                the.emit('enter', the._lastMatchedRouter);
                the._routerList[matchIndex][matchKey].forEach(function (callback) {
                    callback(matched);
                });
            } else {
                the._lastMatchedRouter = null;
            }
        };

        event.on(window, 'hashchange', the._onhashchange);
        controller.nextTick(function () {
            the._onhashchange({
                newURL: location.href
            });
        });
    };

    Router.fn.when = function (route, callback) {
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
    };

    module.exports = Router;
});