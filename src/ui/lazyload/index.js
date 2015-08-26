/*!
 * 图片懒加载
 * @author ydr.me
 * @create 2015-05-18 16:00
 */


define(function (require, exports, module) {
    /**
     * @module ui/lazyload/
     * @requires utils/dato
     * @requires utils/controller
     * @requires libs/scroll
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/see
     */

    'use strict';

    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');
    var ui = require('../');
    var Scroll = require('../../libs/scroll.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var see = require('../../core/dom/see.js');
    var win = window;
    var doc = win.document;
    var html = doc.documentElement;
    var body = doc.body;
    var alienClass = 'alien-ui-lazyload';
    var REG_RES = /img|iframe/i;
    var defaults = {
        selector: 'img',
        data: 'original',
        offset: 100,
        wait: 123
    };
    var Lazyload = ui.create({
        constructor: function ($container, options) {
            var the = this;

            the._$container = selector.query($container)[0];
            the._options = dato.extend({}, defaults, options);
            the.destroyed = false;
            the._initEvent();
        },


        /**
         * 更新内容区域，当区域内内容发生变化时调用
         */
        update: function () {
            var the = this;
            var options = the._options;

            the._$targets = selector.query(options.selector, the._$container);
            the._onchange();

            return the;
        },


        /**
         * 初始化
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;

            the._onchange = function () {
                if (!the.visible && !the._isDoc) {
                    return;
                }

                dato.each(the._$targets, function (index, $target) {
                    var isInViewport = see.isInViewport($target, options.offset);

                    if (isInViewport && the.emit('match', $target) !== false) {
                        var original = attribute.data($target, options.data);

                        if (original && REG_RES.test($target.tagName)) {
                            $target.src = original;
                            attribute.removeData($target, options.data);
                        }
                    }
                });
            };
            the._isDoc = the._$container === win || the._$container === doc ||
                the._$container === html || the._$container === body;
            the.update();
            the._scroll = new Scroll(the._$container);
            the._scroll.on('x y', controller.debounce(the._onchange, options.wait)).on('enter', function () {
                the.visible = true;
            }).on('leave', function () {
                the.visible = false;
            });
        },

        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
        }
    });

    Lazyload.defaults = defaults;
    module.exports = Lazyload;
});