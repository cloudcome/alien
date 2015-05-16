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
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var Mask = require('../Mask/');
    var Window = require('../Window/');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var Template = require('../../libs/Template.js');
    Template.config({
        debug: true
    });
    var tpl = new Template(template);
    var win = window;
    var defaults = {
        isModal: true,
        style: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            radius: 4,
            offset: 26,
            size: 80,
            count: 12,
            duration: 600,
            width: 4,
            height: 18
        },
        text: '加载中'
    };
    var Loading = ui.create({
        constructor: function (options) {
            if (typeis.string(options)) {
                options.text = options;
            }

            var the = this;

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
                the._mask = new Mask(win).open();
            }

            options.list = new Array(options.style.count);
            the._window = new Window(win, {
                width: 'auto',
                height: 'auto'
            }).setContent(tpl.render(options)).open();
            attribute.css(the._window.getNode().children[0], {
                backgroundColor: options.style.backgroundColor,
                color: options.style.color
            });
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

            the._window.destroy();
        }
    });
    Loading.defaults = defaults;
    modification.importStyle(style);

    /**
     * 实例化一个 Loading
     */
    module.exports = Loading;
});