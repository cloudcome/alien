/*!
 * 单页面应用
 * @author ydr.me
 * @create 2015-10-10 10:49
 */


define(function (require, exports, module) {
    /**
     * @module parent/spa
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
    var defaults = {
        //html5: true,
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
        },


        _initEvent: function () {
            var the = this;

            the._onchange = function (eve) {
                var newURL = eve ? eve.newURL || href : href;
                var parseRet = hashbang.parse(newURL);
                var find = null;

                dato.each(the._ifList, function (index, item) {
                    switch (item.type) {
                        case 'regexp':
                            if (item.route.test(parseRet.pathstring)) {
                                find = item;
                                return false;
                            }
                            break;

                        case 'string':
                            if (hashbang.matches(newURL, item.route)) {
                                find = item;
                                return false;
                            }
                            break;
                    }
                });

                if (find) {
                    the._exec(find);
                } else {
                    the._elseList.forEach(the._exec);
                }
            };

            event.on(win, 'hashchange', the._onchange);
            controller.nextTick(the._onchange);
        },


        /**
         * 执行某个路由
         * @param item
         * @private
         */
        _exec: function (item) {
            item.app = item.app || item.callback();

            if (typeis.function(item.app.enter)) {
                item.app.enter();
            }
        },


        if: function (route, callback) {
            var the = this;
            //var options = the._options;

            if (!typeis.function(callback)) {
                return the;
            }

            the._ifList.push({
                route: route,
                type: typeis(route),
                callback: callback
            });

            return the;
        },


        else: function (callback) {
            var the = this;
            //var options = the._options;

            if (!typeis.function(callback)) {
                return the;
            }

            the._elseList.push(callback);

            return the;
        }
    });


    SPA.defaults = defaults;
    module.exports = SPA;
});