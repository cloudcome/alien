/*!
 * Msg.js
 * @author ydr.me
 * @create 2014-10-10 22:36
 */


define(function (require, exports, module) {
    /**
     * @module ui/Msg/index
     * @requires util/class
     * @requires util/dato
     * @requires core/event/touch
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires ui/dialog
     * @requires ui/generator
     */
    'use strict';

    var style = require('css!./style.css');
    var generator = require('../generator.js');
    var dato = require('../../util/dato.js');
    var Template = require('../../libs/Template.js');
    var template = require('html!./template.html');
    var tpl = new Template(template);
    var event = require('../../core/event/touch.js');
    var Dialog = require('../Dialog/index.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var alienIndex = 0;
    var $body = document.body;
    var alienClass = 'alien-ui-msg';
    var defaults = {
        width: 300,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '提示',
        content: 'Hello world!',
        addClass: '',
        buttons: null,
        canDrag: true,
        timeout: -1
    };
    var mouseevent = {};
    var Msg = generator({
        STATIC: {
            /**
             * 默认配置
             * @name defaults
             * @property [width=300] {Number|String} 消息框宽度
             * @property [height="auto"] {Number|String} 消息框高度
             * @property [left="center"] {Number|String} 消息框左距离，默认水平居中
             * @property [top="center"] {Number|String} 消息框上距离，默认垂直居中（为了美观，表现为2/5处）
             * @property [title="提示"] {String|null} 消息框标题，为null时将隐藏标题栏
             * @property [content="Hello world!"] {String} 消息框内容
             * @property [buttons=null] {Array|null} 消息框按钮数组，如：<code>["确定", "取消"]</code>
             * @property [canDrag] {Boolean} 是否允许拖拽，标题存在时拖拽标题，否则为自身，默认 true
             * @property [timeout] {Number} 消息框消失时间，默认为-1为不消失，单位 ms
             */
            defaults: defaults
        },


        constructor: function (options) {
            var the = this;

            the._options = dato.extend(true, {}, defaults, options);
            the._id = alienIndex++;
            the._init();
        },


        /**
         * 初始化
         * @returns {Msg}
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;

            options.buttons = options.buttons || [];
            the._wrap();
            the._timerId = 0;
            the._timeout();
            the._event();

            return the;
        },


        /**
         * 包裹
         * @private
         */
        _wrap: function () {
            var the = this;
            var options = the._options;
            var msgData = {
                title: options.title,
                canDrag: options.canDrag,
                buttons: options.buttons,
                id: the._id,
                body: options.content
            };
            var $msg = tpl.render(msgData);
            var $header;

            $msg = modification.parse($msg)[0];
            modification.insert($msg, $body, 'beforeend');

            the._dialog = new Dialog($msg, {
                width: options.width,
                height: options.height,
                left: options.left,
                top: options.top,
                isWrap: false,
                canDrag: false,
                title: null,
                addClass: options.addClass
            }).open();

            if (options.canDrag) {
                if (options.title) {
                    $header = selector.query('.' + alienClass + '-header', $msg)[0];
                    attribute.attr($header, 'draggablefor', 'alien-ui-dialog-' + the._dialog._id);
                } else {
                    attribute.attr($msg, 'draggablefor', 'alien-ui-dialog-' + the._dialog._id);
                }
            }

            the._$msg = $msg;
            the._$body = selector.query('.' + alienClass + '-body', $msg)[0];
        },

        /**
         * 超时处理
         * @private
         */
        _timeout: function () {
            var the = this;
            var options = the._options;

            if (options.timeout > 0) {
                if (the._timerId) {
                    clearTimeout(the._timerId);
                }

                the._timerId = setTimeout(function () {
                    var dialog = the._dialog._dialog;
                    var x0 = attribute.left(dialog);
                    var y0 = attribute.top(dialog);
                    var x1 = x0 + attribute.outerWidth(dialog);
                    var y1 = y0 + attribute.outerHeight(dialog);
                    var x = mouseevent.clientX;
                    var y = mouseevent.clientY;

                    if (!(x >= x0 && x <= x1 && y >= y0 && y <= y1)) {
                        the.destroy();
                    }
                }, options.timeout);
            }
        },


        /**
         * 响应事件
         * @private
         */
        _event: function () {
            var the = this;

            // 点击关闭对话框
            event.on(the._dialog._$dialog, 'click tap', '.' + alienClass + '-close', function () {
                the.destroy();
                the.emit('close', -1);
            });

            // 点击按钮响应事件
            event.on(the._dialog._$dialog, 'click tap', '.' + alienClass + '-button', function (eve) {
                the.destroy();
                the.emit('close', attribute.data(eve.target, 'index'));
            });

            // 鼠标进入、离开
            if (the._options.timeout > 0) {
                event.on(the._dialog._$dialog, 'mouseover dragstart drag', function () {
                    if (the._timerId) {
                        clearTimeout(the._timerId);
                        the._timerId = 0;
                    }
                });

                event.on(the._dialog._$dialog, 'mouseout dragend', function () {
                    the._timeout();
                });
            }
        },


        /**
         * 设置对话框内容
         * @param content
         * @returns {Msg}
         */
        setContent: function (content) {
            var the = this;

            if (content) {
                the._$body.innerHTML = the._options.content = String(content);
            }

            return the;
        },


        /**
         * 晃动消息框，以示提醒
         * @returns {Msg}
         */
        shake: function () {
            this._dialog.shake();

            return this;
        },


        /**
         * 销毁消息框
         */
        destroy: function () {
            var the = this;

            // 卸载事件
            event.un(the._dialog._dialog, 'click tap mouseover dragstart drag mouseout dragend');

            // 销毁对话框
            the._dialog.destroy(function () {
                // 在 DOM 里删除
                modification.remove(the._$msg);
            });
        }
    });

    modification.importStyle(style);

    event.on(document, 'mousemove', function (eve) {
        mouseevent = eve;
    });


    /**
     * 实例化一个临时消息框
     *
     * @param {Object} [options]
     * @param [options.width=300] {Number|String} 消息框宽度
     * @param [options.height="auto"] {Number|String} 消息框高度
     * @param [options.left="center"] {Number|String} 消息框左距离，默认水平居中
     * @param [options.top="center"] {Number|String} 消息框上距离，默认垂直居中（为了美观，表现为2/5处）
     * @param [options.title="提示"] {String|null} 消息框标题，为null时将隐藏标题栏
     * @param [options.content="Hello world!"] {String} 消息框内容
     * @param [options.addClass=""] {String} 消息框添加的 className
     * @param [options.buttons=null] {Array|null} 消息框按钮数组，如：<code>["确定", "取消"]</code>
     * @param [options.canDrag] {Boolean} 是否允许拖拽，标题存在时拖拽标题，否则为自身，默认 true
     * @param [options.timeout] {Number} 消息框消失时间，默认为-1为不消失，单位 ms
     * @constructor
     */
    module.exports = Msg;
});