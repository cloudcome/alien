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
        addClass: ''
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
                class: alienClass,
                id: alienClass + '-' + alienId++
            });
            the._$loading.innerHTML = tpl.render(options);
            modification.insert(the._$loading, body);
            the.resize();
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
                    translateY: '-50%',
                    visibility: '',
                    zIndex: ui.getZindex()
                });
            } else {
                attribute.css(the._$loading, {
                    left: coverStyle.left + coverStyle.width / 2 - maxSize / 2,
                    top: coverStyle.top + coverStyle.height / 2 - maxSize / 2,
                    visibility: '',
                    translateX: 0,
                    translateY: 0,
                    zIndex: ui.getZindex()
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
        done: function () {
            var the = this;

            if (the._mask) {
                the._mask.destroy();
            }

            modification.remove(the._$loading);
        }
    });
    Loading.defaults = defaults;
    modification.importStyle(style);

    /**
     * 实例化一个 Loading
     */
    module.exports = Loading;
});