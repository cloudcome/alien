/*!
 * 对话框
 * @author ydr.me
 * @create 2015-01-11 16:53
 */


define(function (require, exports, module) {
    /**
     * @module ui/Dialog/
     */
    'use strict';

    var Mask = require('../Mask/');
    var Window = require('../Window/');
    var Scrollbar = require('../Scrollbar/');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/drag.js');
    var Template = require('../../libs/Template.js');
    var template = require('html!./template.html');
    var style = require('css!./style.css');
    var tpl = new Template(template);
    var ui = require('../base.js');
    var $body = document.body;
    var defaults = {
        width: 500,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '无标题对话框',
        canDrag: true,
        hideClose: false,
        duration: 456,
        easing: 'ease-in-out-back',
        addClass: '',
        // 优先级2
        remote: null,
        remoteHeight: 400,
        // 优先级1
        content: null,
        // 优先级1
        isWrap: true,
        isModal: true,
        zIndex: null
    };
    var alienIndex = 0;
    var alienClass = 'alien-ui-dialog';
    var Dialog = ui.create({
        constructor: function ($content, options) {
            var the = this;

            the._$content = selector.query($content)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        _init: function () {
            var the = this;
            var options = the._options;

            if (options.isModal) {
                the._mask = new Mask(window, {
                    addClass: alienClass + '-bg'
                });
                the._$mask = the._mask.getNode();
            }

            the._window = new Window(null, {
                parentNode: options.isModal ? the._$mask : $body
            });
            the._$window = the._window.getNode();
            the._initNode();

            if (options.isModal) {
                the._scrollbar = new Scrollbar(the._$window);
            }

            the._initEvent();

            return the;
        },


        _initNode: function () {
            var the = this;
            var options = the._options;
            var html = tpl.render({
                id: alienIndex++,
                windowId: the._$window.id,
                title: options.title,
                canDrag: options.canDrag,
                hideClose: options.hideClose
            });
            var node = modification.parse(html)[0];
            var nodes = selector.query('.j-flag', node);
            var $pos = modification.create('div');

            the._$dialog = node;
            the._$header = nodes[0];
            the._$title = nodes[1];
            the._$close = nodes[2];
            the._$body = nodes[3];

            modification.insert(the._$dialog, the._$window);
            modification.insert($pos, the._$content, 'afterend');
            the._$pos = $pos;
            modification.insert(the._$content, the._$body);
        },


        _initEvent: function () {
            var the = this;

            // 对话框打开
            the._window.on('open', function () {
                if (the._scrollbar) {
                    the._scrollbar.resize();
                }
            });

            // 点击关闭
            event.on(the._$close, 'click', function () {
                the.close();
            });
        },


        /**
         * 打开 dialog
         * @param [callback] {Function} 回调
         */
        open: function (callback) {
            var the = this;

            the._mask.open();
            the._window.open(callback);

            return the;
        },


        /**
         * 改变 dialog 尺寸
         * @param [size] {Object} 尺寸
         * @param [callback] {Function} 回调
         */
        resize: function (size, callback) {
            this._window.resize(size, callback);
        },


        /**
         * 关闭 dialog
         * @param [callback] {Function} 回调
         */
        close: function (callback) {
            var the = this;


            the._window.close(function () {
                the._mask.close();

                if (typeis.function(callback)) {
                    callback();
                }
            });

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;
            var destroy = function () {
                modification.insert(the._$content, the._$pos, 'afterend');
                modification.remove(the._$pos);
                event.un(the._$close, 'click');
                modification.remove(the._$dialog);
                the._window.destroy();
                the._mask.destroy();
            };

            if (the._window.visible) {
                the._window.close(destroy);
            } else {
                destroy();
            }
        }
    });


    modification.importStyle(style);
    module.exports = Dialog;
});