/**
 * screen
 * @author ydr.me
 * @create 2015-12-21 18:50
 */


define(function (require, exports, module) {
    /**
     * @module ui/screen
     * @requires ui/
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/allocation
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires core/dom/attribute
     */

    'use strict';

    var ui = require('../index.js');
    var Mask = require('../mask/index.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var allocation = require('../../utils/allocation.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var attribute = require('../../core/dom/attribute.js');
    var style = require('./style.css', 'css');

    var win = window;
    var doc = win.document;
    var html = doc.documentElement;
    var body = doc.body;
    var namespace = 'alien-ui-screen';
    var alienIndex = 0;
    var defaults = {
        // 默认模态
        modal: true,
        // 默认向上弹出
        direction: 'top',
        // 初始位置
        style: {
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            overflow: 'auto',
            overflowScrolling: 'touch',
            translateY: '100%'
        },
        maskStyle: {
            backgroud: 'rgba(0,0,0,0.3)'
        },
        easing: 'in-out',
        duration: 345,
        template: null,
        addClass: '',
        mask: true
    };
    var Screen = ui.create({
        constructor: function ($content, options) {
            var the = this;
            var args = allocation.args(arguments);

            if (args.length === 1 && typeis.plainObject(args[0])) {
                options = args[0];
                $content = null;
            }

            the._$content = selector.query($content)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._initNode();
            the._initEvent();
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;

            the._mask = new Mask({
                style: options.maskStyle
            });
            the._$screen = modification.create('div', {
                style: options.style
            });

            if (the._$content) {
                var $flag = the._$flag = modification.create('#comment', namespace + '-' + alienIndex++);
                modification.insert($flag, the._$content, 'afterend');
                modification.insert(the._$content, the._$screen);
            } else if (options.template) {
                the.html(options.template);
            }

            attribute.addClass(the._$screen, options.addClass);
            modification.insert(the._$screen, document.body);
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;
            var className = namespace + '-overflow';

            the.before('open', function () {
                if (options.modal) {
                    attribute.addClass([html, body], className);
                }
            }).on('close', function () {
                attribute.removeClass([html, body], className);
            });
        },


        /**
         * 设置 html
         * @param html
         * @returns {Screen}
         */
        html: function (html) {
            var the = this;

            the._$screen.innerHTML = html;
            return the;
        },


        /**
         * 返回节点
         * @returns {Node|*}
         */
        getNode: function () {
            return this._$screen;
        },


        /**
         * 打开屏幕
         * @param [callback] {Function} 屏幕打开后回调
         * @returns {Screen}
         */
        open: function (callback) {
            var the = this;
            var options = the._options;
            var to = {};

            if (options.direction === 'top' || options.direction === 'bottom') {
                to.translateY = 0;
            } else {
                to.translateX = 0;
            }

            the.emit('beforeopen');
            the._mask.open();
            to.zIndex = ui.getZindex();
            animation.transition(the._$screen, to, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                the.emit('open');
                if (typeis.Function(callback)) {
                    callback.call(the);
                }
            });

            return the;
        },


        /**
         * 关闭屏幕
         * @param [callback] {Function} 屏幕关闭后回调
         * @returns {Screen}
         */
        close: function (callback) {
            var the = this;
            var options = the._options;

            the.emit('beforeclose');
            animation.transition(the._$screen, options.style, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                the.emit('close');
                the._mask.close();
                if (typeis.Function(callback)) {
                    callback.call(the);
                }
            });

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;

            if (the._mask) {
                the._mask.destroy();
            }

            if (the._$content) {
                modification.insert(the._$content, the._$flag, 'beforebegin');
                modification.remove(the._$flag);
            }

            modification.remove(the._$screen);
        }
    });

    ui.importStyle(style);
    Screen.defaults = defaults;
    module.exports = Screen;
});