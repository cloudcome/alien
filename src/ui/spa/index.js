/*!
 * 单页面应用
 * @author ydr.me
 * @create 2015-10-10 10:49
 */


define(function (require, exports, module) {
    /**
     * @module parent/spa
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/event/base
     * @requires utils/typeis
     * @requires utils/hashbang
     * @requires utils/dato
     * @requires utils/controller
     */

    'use strict';

    var ui = require('../index.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/base.js');
    var typeis = require('../../utils/typeis.js');
    var hashbang = require('../../utils/hashbang.js');
    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');

    var win = window;
    var href = win.location.href;
    var defaults = {
        ignoreCase: false,
        strict: false
    };

    var SPA = ui.create({
        constructor: function ($view, options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the._ifList = [];
            the._elseList = [];
            the._listen = true;
            the._index = 0;
            the.$view = selector.query($view)[0];
            the.className = 'spa';
            the._initNode();
            the._initEvent();
        },


        _initNode: function () {
            var the = this;

            the._$style = modification.importStyle('');
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
                    the._exec(find, matches, parseRet);
                } else {
                    // 连续 404
                    if (the._lastItem === false) {
                        return;
                    }

                    the._lastItem = false;
                    the._elseList.forEach(function (item) {
                        the._exec(item, matches, parseRet);
                    });
                }
            };

            event.on(win, 'hashchange', the._onchange);
            controller.nextTick(the._onchange);
        },


        /**
         * 执行某个路由
         * @param item
         * @param matches
         * @param parseRet
         * @private
         */
        _exec: function (item, matches, parseRet) {
            var the = this;
            var isSameItem = the._lastItem && the._lastItem.index === item.index;
            var exec = function () {
                if (the._lastItem && the._lastItem.index !== item.index) {
                    the.emit('beforeleave', the._lastItem, matches, parseRet.query);

                    if (typeis.function(the._lastItem.exports.leave)) {
                        the._lastItem.exports.leave(the, parseRet.uri);
                    }

                    the.emit('afterleave', the._lastItem, matches, parseRet.query);
                }

                if (isSameItem) {
                    if (typeis.function(item.exports.update)) {
                        item.exports.update(the, matches, parseRet.query);
                        the._lastItem = item;
                    }

                    the.emit('afterupdate', item, matches, parseRet.query);
                } else {
                    if (typeis.function(item.exports.enter)) {
                        item.exports.enter(the, matches, parseRet.query);
                        the._lastItem = item;
                    }

                    the.emit('afterenter', item, matches, parseRet.query);
                }
            };

            the.emit(isSameItem ? 'beforeupdate' : 'beforeenter', item, matches, parseRet.query);

            if (item.exports) {
                exec();
            } else {
                the.emit('beforeloading', item, matches, parseRet.query);
                item.callback(function (exports) {
                    item.exports = exports;
                    the.emit('afterloading', item, matches, parseRet.query);
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


        /**
         * 路由跳转
         * @param uri {String} 跳转的地址，不需要包含前缀
         * @param [isListen=true] {Boolean} 是否监听本次跳转
         * @returns {SPA}
         */
        redirect: function (uri, isListen) {
            var the = this;
            //var options = the._options;
            var to = '#!' + uri;

            if (location.hash === to) {
                return the;
            }

            the._listen = isListen !== false;
            location.hash = to;

            return the;
        },


        /**
         * 导入 spa 样式
         * @param styleString
         */
        style: function (styleString) {
            var the = this;

            ui.importStyle(styleString, the._$style);
        }
    });


    SPA.defaults = defaults;
    module.exports = SPA;
});