/*!
 * loading ui
 * @author ydr.me
 * @create 2015-05-15 10:19
 */

define(function (require, exports, module) {
    /**
     * @module ui/loading/
     * @requires ui/
     * @requires utils/typeis
     * @requires utils/dato
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires core/dom/keyframes
     * @requires ui/mask/
     * @requires ui/window/
     * @requires libs/template
     */

    'use strict';

    var ui = require('../index.js');
    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var keyframes = require('../../core/dom/keyframes.js');
    var Mask = require('../mask/index.js');
    var Window = require('../window/index.js');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var Template = require('../../libs/template.js');
    var loadingGif = require('./loading.gif', 'image');
    var win = window;
    var doc = win.document;
    var html = doc.documentElement;
    var body = doc.body;
    var tpl = new Template(template);
    var namespace = 'alien-ui-loading';
    var alienId = 0;
    var defaults = {
        text: '加载中',
        modal: true
    };
    var Loading = ui.create({
        constructor: function (options) {
            if (typeis.string(options)) {
                options = {
                    text: options
                };
            }

            var the = this;

            the._options = dato.extend(true, {}, defaults, options);
            the.destroyed = false;
            the.id = alienId++;
            the._initNode();
        },


        _initNode: function () {
            var the = this;
            var options = the._options;

            if (options.modal) {
                the._mask = new Mask(the._$parent);
            }

            modification.insert(tpl.render({
                id: the.id
            }), body);
            the._$loading = selector.query('#' + namespace + '-' + the.id)[0];
            the._$inner = selector.children(the._$loading)[0];
            var nodes = selector.children(the._$inner);
            the._$gif = nodes[0];
            the._$text = nodes[1];
            the._window = new Window(the._$loading, {
                width: 'height',
                height: 'width',
                minWidth: 30
            });
        },


        /**
         * 设置 loading 文本
         * @param text {String} loading 文本
         * @returns {Loading}
         */
        setText: function (text) {
            var the = this;
            var options = the._options;

            options.text = typeis.empty(text) ? '' : text;
            the._$text.innerHTML = text;
            attribute.css(the._$text, {
                display: options.text ? 'block' : 'none'
            });

            the._window.resize();

            return the;
        },


        /**
         * 重置尺寸
         * @returns {Loading}
         */
        resize: function () {
            var the = this;

            the._window.resize();

            return the;
        },


        /**
         * 打开 loading
         * @param [callback] {Function} 关闭后回调
         * @returns {Loading}
         */
        open: function (callback) {
            var the = this;

            the.setText(the._options.text);

            if (the._mask) {
                the._mask.open();
            }

            the._window.open(callback);
            return the;
        },


        /**
         * 关闭 loading，关闭不会删除 loading，若要删除 loading 使用 done 或 destroy
         * @param [callback] {Function} 关闭后回调
         * @returns {Loading}
         */
        close: function (callback) {
            var the = this;

            the._window.close(callback);

            if (the._mask) {
                the._mask.close();
            }

            return the;
        },


        /**
         * loading 结束
         * @param callback
         */
        done: function (callback) {
            this.destroy(callback);
        },


        /**
         * 销毁实例
         * @param callback
         */
        destroy: function (callback) {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            the._window.destroy(function () {
                modification.remove(the._$loading);

                if (typeis.function(callback)) {
                    callback();
                }
            });

            if (the._mask) {
                the._mask.destroy();
            }
        }
    });


    Loading.defaults = defaults;
    style += '.' + namespace + '-gif{background-image:url(' + loadingGif + ')}';
    ui.importStyle(style);
    module.exports = Loading;
});