/*!
 * 滚动元素的 scroll 监听
 * @author ydr.me
 * @create 2015-04-22 18:08
 */


define(function (require, exports, module) {
    /**
     * @module ui/Scroll/
     * @requires utils/dato
     * @requires utils/controller
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/event/base
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var win = window;
    var doc = win.document;
    var $html = doc.documentElement;
    var $body = doc.body;
    var UI = require('../');
    var defaults = {};
    var Scroll = UI.create(function ($container, options) {
        var the = this;

        the._$container = selector.query($container)[0];
        the._$parent = the._$container;
        the._$offset = the._$container;

        if (the._$container === window || the._$container === doc || the._$container === $html || the._$container === $body) {
            the._$container = doc;
            the._$parent = win;
            the._$offset = $body;
        }

        the._options = dato.extend(true, {}, defaults, options);
        the._init();
    });

    Scroll.implement({
        _init: function () {
            var the = this;

            event.on(the._$container, 'scroll', the._onscroll = function () {
                var scrollTop = attribute.scrollTop(the._$container);
                var scrollLeft = attribute.scrollLeft(the._$container);
                var height = attribute.height(the._$parent);
                var width = attribute.width(the._$parent);
                var scrollHeight = the._$offset.scrollHeight;
                var scrollWidth = the._$offset.scrollWidth;
                var ret;

                if (height < scrollHeight) {
                    if (scrollTop + height >= scrollHeight) {
                        the.emit('bottom');
                    } else if (!scrollTop) {
                        the.emit('top');
                    }

                    ret = {
                        scrollTop: scrollTop,
                        height: height,
                        scrollHeight: scrollHeight,
                        ratio: scrollTop / (scrollHeight - height)
                    };

                    the.emit('y', ret);
                }

                if (width < scrollWidth) {
                    if (scrollLeft + width >= scrollWidth) {
                        the.emit('right');
                    } else if (!scrollLeft) {
                        the.emit('left');
                    }

                    ret = {
                        scrollTop: scrollTop,
                        height: height,
                        scrollHeight: scrollHeight,
                        ratio: scrollTop / (scrollHeight - height)
                    };

                    the.emit('x', ret);
                }
            });

            controller.nextTick(the._onscroll, the);
        },


        /**
         * 实例销毁
         */
        destroy: function () {
            var the = this;

            event.un(the._$container, 'scroll', the._onscroll);
        }
    });

    module.exports = Scroll;
});