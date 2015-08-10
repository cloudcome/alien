/*!
 * Msg
 * @author ydr.me
 * @create 2015-01-12 10:47
 */


define(function (require, exports, module) {
    /**
     * @module ui/msg/
     * @requires ui/mask/
     * @requires ui/window/
     * @requires ui/
     * @requires utils/dato
     * @requires utils/typeis
     * @requires libs/template
     * @requires libs/emitter
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/event/drag
     * @requires core/event/touch
     */

    'use strict';

    var Mask = require('../mask/');
    var Window = require('../window/');
    var ui = require('../');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var controller = require('../../utils/controller.js');
    var Template = require('../../libs/template.js');
    var Emitter = require('../../libs/emitter.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/drag.js');
    require('../../core/event/touch.js');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var tpl = new Template(template);
    var alienIndex = 0;
    var alienClass = 'alien-ui-msg';
    var doc = document;
    var $body = doc.body;
    var defaults = {
        width: '33%',
        minWidth: 300,
        maxWidth: 900,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '提示',
        content: '提示',
        addClass: '',
        buttons: null,
        canDrag: true,
        isModal: true,
        duration: 123,
        easing: 'swig',
        timeout: 0,
        autoFocus: true,
        autoOpen: true
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
            the._isReady = false;
            the.destroyed = false;
            the._initNode();
            the._initEvent();

            if (the._options.autoOpen) {
                the.open();
            }

            return the;
        },


        _initNode: function () {
            var the = this;
            var options = the._options;

            if (options.isModal) {
                the._mask = new Mask(window, {
                    addClass: alienClass + '-bg ' + options.addClass
                });
                the._mask.__msg = the;
                the._$mask = the._mask.getNode();
            }

            the._window = new Window(null, {
                parentNode: the._mask ? the._$mask : $body,
                width: options.width,
                minWidth: options.minWidth,
                maxWidth: options.maxWidth,
                height: options.height,
                left: options.left,
                top: options.top,
                duration: options.duration,
                easing: options.easing,
                addClass: options.isModal ? '' : options.addClass,
                autoFocus: options.autoFocus
            });
            the._$window = the._window.getNode();

            var html = tpl.render({
                id: the.id,
                title: options.title,
                canDrag: options.canDrag,
                windowId: the._$window.id,
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
            the._$body.innerHTML = options.content;
        },

        _initEvent: function () {
            var the = this;

            // 关闭 msg
            event.on(the._$close, 'click', function () {
                if (!the._window.visible) {
                    return;
                }

                /**
                 * 消息框被关闭后
                 * @event close
                 * @param index {Number} 选择的按钮索引，-1 为点击关闭按钮
                 */
                if (the.emit('close', -1) !== false) {
                    the.destroy();
                }
            });

            // 点击按钮
            event.on(the._$buttons, 'click', '.j-flag', function () {
                if (!the._window.visible) {
                    return;
                }

                var index = attribute.data(this, 'index');

                /**
                 * 消息框被关闭后
                 * @event close
                 * @param index {Number} 选择的按钮索引，-1 为点击关闭按钮
                 */
                if (the.emit('close', index) !== false) {
                    the.destroy();
                }
            });

            // 传递部分 window 事件到 msg
            Emitter.pipe(the._window, the, ['!open', '!close']);
        },


        /**
         * 打开对话框
         */
        open: function () {
            var the = this;
            var options = the._options;

            if (the._mask) {
                the._mask.open();
            }

            the._window.open(function () {
                the._isReady = true;
                /**
                 * 消息框打开之后
                 * @event open
                 */
                the.emit('open');
            });

            if (options.timeout) {
                setTimeout(function () {
                    /**
                     * 消息框关闭之后
                     * @event close
                     */
                    the.emit('close');
                    the.destroy();
                }, options.timeout);
            }

            return the;
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
         * 获取 body 节点
         * @returns {*|Element}
         */
        getBodyNode: function () {
            return this._$body;
        },


        /**
         * 调整尺寸及位置
         * @returns {Msg}
         */
        resize: function () {
            var the = this;

            the._window.resize();

            return the;
        },


        /**
         * 调整位置
         * @returns {Msg}
         */
        position: function () {
            var the = this;

            the._window.position();

            return the;
        },


        /**
         * 关闭消息框
         * @param callback
         * @returns {Msg}
         */
        close: function (callback) {
            var the = this;

            the._mask.close();
            the._window.close(callback);

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
            the._window.destroy(function () {
                event.un(the._$close, 'click');
                event.un(the._$buttons, 'click');

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
     */
    module.exports = Msg;
    Msg.defaults = defaults;
    ui.importStyle(style);
});