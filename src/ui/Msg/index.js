/*!
 * Msg
 * @author ydr.me
 * @create 2015-01-12 10:47
 */


define(function (require, exports, module) {
    /**
     * @module ui/Msg/
     * @module ui/Mask/
     * @module ui/Window/
     */

    'use strict';

    var Mask = require('../Mask/');
    var Window = require('../Window/');
    var ui = require('../base.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var Template = require('../../libs/Template.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/drag.js');
    var template = require('html!./template.html');
    var style = require('css!./style.css');
    var tpl = new Template(template);
    var alienIndex = 0;
    var alienClass = 'alien-ui-msg';
    var $body = document.body;
    var defaults = {
        width: 300,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '提示',
        content: '提示',
        addClass: '',
        buttons: null,
        canDrag: true,
        isModal: true,
        duration: 345,
        timeout: 0,
        easing: 'ease-in-out-back',
        zIndex: null
    };
    var Msg = ui.create({
        constructor: function (options) {
            var the = this;

            if (typeis.string(options)) {
                options = {
                    content: options
                };
            }

            the._options = dato.extend(true, {}, defaults, options);
            the._options.buttons = the._options.buttons || [];
            the.id = alienIndex++;
            the._init();
        },


        _init: function () {
            var the = this;

            the._initNode();
            the._initEvent();

            if (the._mask) {
                the._mask.open();
            }

            the._window.open();

            if (the._options.timeout) {
                setTimeout(the.destroy.bind(the), the._options.timeout);
            }

            return the;
        },


        _initNode: function () {
            var the = this;
            var options = the._options;

            if (options.isModal) {
                the._mask = new Mask(window, {
                    addClass: alienClass + '-bg ' + options.addClass,
                    zIndex: options.zIndex
                });
                the._mask.__msg = the;
                the._$mask = the._mask.getNode();
            }

            the._window = new Window(null, {
                parentNode: the._mask ? the._$mask : $body,
                width: options.width,
                height: options.height,
                left: options.left,
                top: options.top,
                duration: options.duration,
                easing: options.easing,
                zIndex: options.zIndex,
                addClass: options.isModal ? '' : options.addClass
            });
            the._$window = the._window.getNode();

            var html = tpl.render({
                id: the.id,
                title: options.title,
                canDrag: options.canDrag,
                windowId: the._$window.id,
                body: options.content,
                buttons: options.buttons
            });
            var node = modification.parse(html)[0];
            var nodes = selector.query('.j-flag', node);

            modification.insert(node, the._$window);
            attribute.css(the._$window, {
                width: options.width,
                height: options.height
            });
            the._$msg = node;
            the._$header = nodes[0];
            the._$title = nodes[1];
            the._$close = nodes[2];
            the._$body = nodes[3];
            the._$buttons = nodes[4];
        },


        _initEvent: function () {
            var the = this;

            // 关闭 msg
            event.on(the._$close, 'click', function () {
                the.destroy();
            });

            // 点击按钮
            event.on(the._$buttons, 'click', '.j-flag', function () {
                var index = attribute.data(this, 'index');

                the.emit('close', index);
                the.destroy();
            });

            if (the._mask) {
                // esc
                the._mask.on('esc', function () {
                    if (the.emit('esc') !== false) {
                        the.shake();
                    }
                });

                // hitbg
                the._mask.on('hit', function () {
                    if (the.emit('hitbg') !== false) {
                        the.shake();
                    }
                });
            }
        },


        /**
         * 设置 Msg 标题
         * @param title {String} 对话框标题
         */
        setTitle: function (title) {
            var the = this;

            the._$title.innerHTML = title;

            return the;
        },


        /**
         * 设置 Msg 内容
         * @param html {String} 对话框内容
         */
        setContent: function (html) {
            var the = this;

            the._$body.innerHTML = html;
            the._window.resize();

            return the;
        },

        /**
         * 震晃窗口以示提醒
         */
        shake: function () {
            var the = this;

            the._window.shake();

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            the._window.destroy(function () {
                event.un(the._$close, 'click');
                event.un(the._$buttons, 'click');
                event.un(the._$mask, 'click');

                if (the._mask) {
                    the._mask.destroy();
                }
            });
        }
    });

    /**
     * 实例化一个 Msg 交互框
     * @param [options] {Object} 配置
     * @param [options.width=300] {Number} 宽度
     * @param [options.height="auto"] {Number|String} 高度
     * @param [options.left="center"] {Number|String} 左位移
     * @param [options.top="center"] {Number|String} 上位移
     * @param [options.title="提示"] {null|String} 标题，为 null 时不显示标题
     * @param [options.content="提示"] {String} 内容
     * @param [options.addClass=""] {String} 添加的类
     * @param [options.buttons=null] {null|Array} 按钮数组，如["确定"]
     * @param [options.canDrag=true] {Boolean} 是否可以被拖拽
     * @param [options.isModal=true] {Boolean} 是否为模态
     * @param [options.duration=345] {Number} 动画时间
     * @param [options.timeout=0] {Number} 大于0时，消息框停留时间，超时后自动消失
     * @param [options.easing="ease-in-out-back"] {String} 动画缓冲
     * @param [options.zIndex=null] {null|Number} 消息框层级，为 null 时自动分配
     */
    module.exports = Msg;
    modification.importStyle(style);
});