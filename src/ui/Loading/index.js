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
        constructor: function ($parent, options) {
            if (typeis.string(options)) {
                options = {
                    text: options
                };
            }

            var the = this;

            the._$parent = selector.query($parent)[0];

            if (the._$parent === win || the._$parent === doc || the._$parent === html || !the._$parent) {
                the._$parent = win;
            }

            the._options = dato.extend({}, defaults, options);
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
                id: alienClass + alienId++,
                style: {
                    backgroundColor: options.style.backgroundColor,
                    color: options.style.color
                }
            });
            the._$loading.innerHTML = tpl.render(options);
            modification.insert(the._$loading, body);
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
        }
    });
    Loading.defaults = defaults;
    modification.importStyle(style);

    /**
     * 实例化一个 Loading
     */
    module.exports = Loading;
});