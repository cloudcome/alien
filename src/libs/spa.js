/*!
 * 单页面应用
 * @author ydr.me
 * @create 2015-10-10 10:49
 */


define(function (require, exports, module) {
    /**
     * @module parent/spa
     * @requires libs/emitter
     * @requires core/event/base
     * @requires utils/class
     * @requires utils/typeis
     * @requires utils/hashbang
     * @requires utils/dato
     * @requires utils/controller
     */

    'use strict';

    var Emitter = require('./emitter.js');
    var event = require('../core/event/base.js');
    var klass = require('../utils/class.js');
    var typeis = require('../utils/typeis.js');
    var hashbang = require('../utils/hashbang.js');
    var dato = require('../utils/dato.js');
    var controller = require('../utils/controller.js');

    var win = window;
    var href = win.location.href;
    var alienIndex = 1;
    var defaults = {
        root: '/',
        prefix: '!',
        autoLink: true,
        ignoreCase: false,
        strict: false
    };

    var SPA = klass.extends(Emitter).create({
        constructor: function (options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the._initEvent();
            the._ifList = [];
            the._elseList = [];
            the._listen = true;
            the._index = 0;
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;

            the._onchange = function (eve) {
                // 跳过本次监听
                if (!the._listen) {
                    the._listen = true;
                    return;
                }

                var newURL = eve ? eve.newURL || href : href;
                var parseRet = hashbang.parse(newURL);
                var find = null;
                var matches = null;

                dato.each(the._ifList, function (index, item) {
                    switch (item.type) {
                        case 'regexp':
                            if ((matches = parseRet.pathstring.match(item.route))) {
                                find = item;
                                return false;
                            }
                            break;

                        case 'string':
                            if ((matches = hashbang.matches(newURL, item.route, the._options))) {
                                find = item;
                                return false;
                            }
                            break;
                    }
                });

                if (find) {
                    the._exec(find, parseRet, matches);
                } else {
                    the._elseList.forEach(function (item) {
                        the._exec(item, parseRet, matches);
                    });
                }
            };

            event.on(win, 'hashchange', the._onchange);
            controller.nextTick(the._onchange);
        },


        /**
         * 执行某个路由
         * @param item
         * @param parseRet
         * @param matches
         * @private
         */
        _exec: function (item, parseRet, matches) {
            var the = this;
            var isSameItem = the._lastItem && the._lastItem.index === item.index;
            var exec = function () {
                if (the._lastItem && the._lastItem.index !== item.index) {
                    the.emit('beforeleave', the._lastItem);

                    if (typeis.function(the._lastItem.app.leave)) {
                        the._lastItem.app.leave.call(the, parseRet.uri);
                    }

                    the.emit('afterleave', the._lastItem);
                }

                if (isSameItem) {
                    if (typeis.function(item.app.update)) {
                        item.app.update.call(the, matches, parseRet.query);
                        the._lastItem = item;
                    }

                    the.emit('afterupdate', the._lastItem);
                } else {
                    if (typeis.function(item.app.enter)) {
                        item.app.enter.call(the, matches, parseRet.query);
                        the._lastItem = item;
                    }

                    the.emit('afterenter', the._lastItem);
                }
            };

            the.emit(isSameItem ? 'beforeupdate' : 'beforeenter', item.index);

            if (item.app) {
                exec();
            } else {
                item.callback(function (exports) {
                    item.app = exports;
                    exec();
                });
            }
        },


        /**
         * 匹配路由
         * @param route {String/RegExp} 路由规则
         * @param callback {Function} 回调
         * @returns {SPA}
         */
        if: function (route, callback) {
            var the = this;
            //var options = the._options;

            if (!typeis.function(callback)) {
                return the;
            }

            the._ifList.push({
                index: the._index++,
                route: route,
                type: typeis(route),
                callback: callback
            });

            return the;
        },


        /**
         * 未匹配路由
         * @param callback {Function} 回调
         * @returns {SPA}
         */
        else: function (callback) {
            var the = this;
            //var options = the._options;

            if (!typeis.function(callback)) {
                return the;
            }

            the._elseList.push({
                callback: callback
            });

            return the;
        },


        redirect: function (uri, isListen) {
            var the = this;

            location.hash = '#!' + uri;
            the._listen = isListen !== false;

            return the;
        }
    });


    SPA.defaults = defaults;
    module.exports = SPA;
});