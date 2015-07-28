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
    var win = window;
    var doc = win.document;
    var html = doc.documentElement;
    var body = doc.body;
    var tpl = new Template(template);
    var alienClass = 'alien-ui-loading';
    var alienId = 0;
    var defaults = {
        // 是否模态
        modal: true,
        style: {
            // 扇叶数量
            count: 10,
            // 扇叶尺寸
            size: 50,
            // 加载文字，为空时不显示
            text: '加载中',
            // 背景色
            background: 'rgba(0,0,0,0.8)',
            // 文本颜色，扇叶颜色
            color: '#fff',
            // 文本字体大小
            fontSize: 14,
            // 扇叶外边距
            margin: 10
        },
        // 添加的 class
        addClass: '',
        // 动画时间
        duration: 789,
        // 动画缓冲
        easing: 'in-out'
    };
    var opacity = keyframes.create({
        0: {
            opacity: 1
        },
        1: {
            opacity: 0
        }
    });
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
            the.id = alienId++;
            the._init();
            the.update();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;
            var html = tpl.render({
                list: new Array(options.style.count),
                id: the.id,
                style: options.style
            });

            modification.insert(html, body);
            the._$loading = selector.query('#' + alienClass + '-' + the.id)[0];
            var nodes = selector.query('.j-flag', the._$loading);
            the._$shadow = nodes[0];
            the._$text = nodes[1];
            the._$items = selector.query('.' + alienClass + '-item');
            the._mask = options.modal ? new Mask(win) : null;
            the._window = new Window(the._$loading, {
                width: 'height',
                height: 'width',
                minWidth: 'none',
                maxWidth: 'none'
            });
        },


        /**
         * 更新 loading 表现
         * @returns {Loading}
         */
        update: function () {
            var the = this;
            var options = the._options;
            var perRotate = 360 / options.style.count;
            var perDelay = options.duration / options.style.count;

            dato.each(the._$items, function (index, $item) {
                attribute.css($item, {
                    rotate: perRotate * index
                });
                var $circle = selector.children($item)[0];
                attribute.css($circle, {
                    background: options.style.color
                });
                animation.keyframes($item, opacity, {
                    duration: options.duration,
                    easing: options.easing,
                    count: -1,
                    delay: perDelay * index
                });
            });
            attribute.css(the._$loading, {
                background: options.style.background
            });
            attribute.css(the._$text, {
                color: options.style.color,
                fontSize: options.style.fontSize,
                margin: options.style.margin,
                marginTop: 0
            });
            attribute.css(the._$shadow, {
                width: options.style.size,
                height: options.style.size,
                margin: options.style.margin
            });

            return the;
        },


        /**
         * 设置 loading 文本
         * @param text {String} loading 文本
         * @returns {Loading}
         */
        setText: function (text) {
            var the = this;

            the._options.style.text = text;
            the.update();
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

            the._window.destroy(callback);

            if (the._mask) {
                the._mask.destroy();
            }
        }
    });


    Loading.defaults = defaults;
    ui.importStyle(style);
    module.exports = Loading;
});