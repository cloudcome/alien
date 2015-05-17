/*!
 * loading ui
 * @author ydr.me
 * @create 2015-05-15 10:19
 */


define(function (require, exports, module) {
    /**
     * @module ui/Loading/
     * @requires ui/
     * @requires utils/typeis
     * @requires utils/dato
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires ui/Mask/
     * @requires ui/Window/
     * @requires libs/Template
     */

    'use strict';

    var ui = require('../');
    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var Mask = require('../Mask/');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var Template = require('../../libs/Template.js');
    var win = window;
    var doc = win.document;
    var html = doc.documentElement;
    var body = doc.body;
    Template.config({
        debug: true
    });
    var tpl = new Template(template);
    var alienClass = 'alien-ui-loading';
    var alienId = 0;
    var defaults = {
        isModal: true,
        style: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: '0',
            radius: 4,
            offset: 22,
            size: 65,
            count: 12,
            duration: 600,
            width: 4,
            height: 18
        },
        text: '加载中',
        addClass: '',
        duration: 123,
        easing: 'in-out'
    };
    var Loading = ui.create({
        /**
         * 生成一个 loading 实例
         * @param $parent
         * @param [options]
         */
        constructor: function ($parent, options) {
            if (typeis.string(options)) {
                options = {
                    text: options
                };
            }

            var the = this;

            the._$parent = selector.query($parent)[0];

            if (the._$parent === win || the._$parent === doc || the._$parent === html || the._$parent === body || !the._$parent) {
                the._$parent = win;
            }

            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;

            if (options.isModal) {
                the._mask = new Mask(the._$parent).open();
            }

            options.list = new Array(options.style.count);

            the._$loading = modification.create('div', {
                class: alienClass + ' ' + options.addClass,
                id: alienClass + '-' + alienId++
            });
            the._$loading.innerHTML = tpl.render(options);
            modification.insert(the._$loading, body);
            the.resize();

            var fromStyle = {
                visibility: '',
                zIndex: ui.getZindex(),
                opacity: 0,
                scale: 0.5
            };
            var toStyle = {
                opacity: 1,
                scale: 1
            };

            attribute.css(the._$loading, fromStyle);
            the.visible = true;
            animation.transition(the._$loading, toStyle, the._transitionOptions = {
                duration: options.duration,
                easing: options.easing
            });
        },


        /**
         * 重置尺寸
         * @returns {Loading}
         */
        resize: function () {
            var the = this;
            var options = the._options;
            var coverStyle = Mask.getCoverSize(the._$parent);
            var loadingStyle = {
                position: coverStyle.position,
                backgroundColor: options.style.backgroundColor,
                border: options.style.border,
                color: options.style.color,
                visibility: 'hidden'
            };

            attribute.css(the._$loading, loadingStyle);

            var width = attribute.outerWidth(the._$loading);
            var height = attribute.outerHeight(the._$loading);
            var maxSize = Math.max(width, height);

            attribute.outerWidth(the._$loading, maxSize);
            attribute.outerHeight(the._$loading, maxSize);

            if (coverStyle.position === 'fixed') {
                attribute.css(the._$loading, {
                    top: '50%',
                    left: '50%',
                    translateX: '-50%',
                    translateY: '-50%'
                });
            } else {
                attribute.css(the._$loading, {
                    left: coverStyle.left + coverStyle.width / 2 - maxSize / 2,
                    top: coverStyle.top + coverStyle.height / 2 - maxSize / 2,
                    translateX: 0,
                    translateY: 0
                });
            }

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            this.done();
        },


        /**
         * loading 结束
         */
        done: function (callback) {
            var the = this;

            if (!the.visible) {
                return;
            }

            the.visible = false;

            if (the._mask) {
                the._mask.destroy();
            }

            animation.transition(the._$loading, {
                opacity: 0,
                scale: 0.5
            }, the._transitionOptions, function () {
                modification.remove(the._$loading);

                if (typeis.function(callback)) {
                    callback();
                }
            });

        }
    });
    Loading.defaults = defaults;
    modification.importStyle(style);

    /**
     * 实例化一个 Loading
     */
    module.exports = Loading;
});