/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-18 16:00
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');
    var ui = require('../');
    var Scroll = require('../../libs/Scroll.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var alienClass = 'alien-ui-lazyload';
    var REG_RES = /img|iframe/i;
    var defaults = {
        selector: 'img',
        data: 'original',
        offset: 10
    };
    var Lazyload = ui.create({
        constructor: function ($container, options) {
            var the = this;

            the._$container = selector.query($container)[0];
            the._options = dato.extend({}, defaults, options);
            the._init();
        },


        /**
         * 更新内容区域，当区域内内容发生变化时调用
         */
        update: function () {
            var the = this;
            var options = the._options;

            the._$targets = selector.query(options.selector, the._$container);

            return the;
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;

            the.update();
            the._scroll = new Scroll(the._$container);
            the._scroll.on('x y', function () {
                if (!the.visible) {
                    return;
                }

                dato.each(the._$targets, function (index, $target) {
                    if (the.emit('match', $target) !== false) {
                        var original = attribute.data($target, options.data);

                        if (original && REG_RES.test($target.tagName)) {
                            $target.src = original;
                            attribute.removeData($target, options.data);
                        }
                    }
                });
            }).on('enter', function () {
                the.visible = true;
            }).on('leave', function () {
                the.visible = false;
            });
        }
    });

    Lazyload.defaults = defaults;
    module.exports = Lazyload;
});