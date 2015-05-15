/*!
 * loading ui
 * @author ydr.me
 * @create 2015-05-15 10:19
 */


define(function (require, exports, module) {
    /**
     * @module widgets/loading
     */

    'use strict';

    var klass = require('../../utils/class.js');
    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var Mask = require('../Mask/');
    var Window = require('../Window/');
    var template = require('./template.html', 'html');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var win = window;
    var defaults = {
        isModal: true,
        size: 100,
        duration: 600,
        text: '加载中'
    };
    var Loading = klass.create({
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

            the._window = new Window(win, {
                width: 'auto',
                height: 'auto'
            }).setContent(tpl.render(options)).open();
        },


        /**
         * loading 结束
         * @public
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


    /**
     * 实例化一个 Loading
     */
    module.exports = Loading;
});