/*!
 * index.js
 * @author ydr.me
 * @create 2014-10-04 21:37
 */


define(function (require, exports, module) {
    /**
     * @module ui/msg/index
     * @requires util/class
     * @requires util/data
     * @requires core/event/touch
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires ui/drag/index
     * @requires ui/dialog/index
     * @requires ui/msg/style
     */
    'use strict';

    require('./style.js');

    var noop = function () {
        // ignore
    };
    var defaults = {
        width: 300,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '提示',
        content: 'Hello world!',
        buttons: null,
        style: 'muted',
        onclose: noop
    };
    var klass = require('../../util/class.js');
    var data = require('../../util/data.js');
    var event = require('../../core/event/touch.js');
    var drag = require('../drag/index.js');
    var dialog = require('../dialog/index.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var index = 0;
    var body = document.body;
    var titleClass = 'alien-ui-msg-title';
    var closeClass = 'alien-ui-msg-close';
    var bodyClass = 'alien-ui-msg-body';
    var buttonClass = 'alien-ui-msg-button';
    var Msg = klass.create({
        STATIC: {
            defaults: defaults
        },


        constructor: function (options) {
            this.options = options;
        },


        _init: function () {
            var the = this;
            var options = the.options;
            var msg = modification.create('div', {
                id: 'alien-ui-msg-' + (++index),
                'class': 'alien-ui-msg alien-ui-msg-' + options.style
            });
            var buttons = '';
            var buttonsLength = 0;

            options.buttons = options.buttons || [];

            /**
             * buttons: ["确定", "取消"]
             * // <=3个按钮水平排列
             * // >3个按钮将纵向排列
             */

            if (data.type(options.buttons) === 'array' && options.buttons.length) {
                buttonsLength = options.buttons.length;
                buttons = '<div class="alien-ui-msg-buttons alien-ui-msg-buttons-' +
                    (buttonsLength > 3 ? 'vertical' : 'horizontal') +
                    ' alien-ui-msg-buttons-' + buttonsLength + '">';

                data.each(options.buttons, function (index, text) {
                    buttons += '<div class="' + buttonClass + ' alien-ui-msg-button-' + index +
                        '">' + text + '</div>';
                });

                buttons += '</div>';
            }

            msg.innerHTML =
                (options.title === null ? '' :
                    '<div class="alien-ui-msg-header">' +
                    '<div class="' + titleClass + '">' + options.title + '</div>' +
                    '<div class="' + closeClass + '">&times;</div>' +
                    '</div>') +
                '<div class="' + bodyClass + '">' + options.content + '</div>' +
                buttons;

            modification.insert(msg, body, 'beforeend');
            the.dialog = dialog(msg, {
                width: options.width,
                height: options.height,
                left: options.left,
                top: options.top,
                isWrap: !1
            }).open();

            if (options.title) {
                drag(the.dialog.dialog, {
                    handle: '.' + titleClass,
                    zIndex: the.dialog.zIndex
                });
            }

            the._event();
            the.msg = msg;
            the.body = selector.query('.' + bodyClass, the.msg)[0];

            return the;
        },


        /**
         * 响应事件
         * @private
         */
        _event: function () {
            var the = this;
            var options = the.options;

            // 点击关闭对话框
            event.on(the.dialog.dialog, 'click tap', '.' + closeClass, function () {
                if (options.onclose.call(the, -1) !== false) {
                    the.destroy();
                }
            });

            // 点击按钮响应事件
            event.on(the.dialog.dialog, 'click tap', '.' + buttonClass, function (eve) {
                var index = selector.index(eve.target);

                if (options.onclose.call(the, index) !== false) {
                    the.destroy();
                }
            });
        },


        /**
         * 设置对话框内容
         * @param content
         * @returns {Msg}
         */
        setContent: function (content) {
            var the = this;

            if (content) {
                the.body.innerHTML = the.options.content = String(content);
            }

            return the;
        },


        /**
         * 晃动消息框，以示提醒
         * @returns {Msg}
         */
        shake: function () {
            this.dialog.shake();

            return this;
        },


        /**
         * 销毁消息框
         */
        destroy: function () {
            var the = this;

            // 卸载事件
            event.un(the.dialog.dialog, 'click tap');

            // 销毁对话框
            the.dialog.destroy(function () {
                // 在 DOM 里删除
                modification.remove(the.msg);
            });
        }
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
     * @param [options.buttons=null] {Array|null} 消息框按钮数组，如：<code>["确定", "取消"]</code>
     * @param [options.style="muted"] {String} 消息框样式，内置的样式有<code>muted/info/success</code>、<code>warning/danger/error/inverse</code>
     * @param [options.onclose] {Function} 关闭对话框后的回调<br>
     *     this: 消息框实例<br>
     *     arguments[0]: {Number} index 即为选择的按钮索引，如果点关闭按钮的话，值为-1
     *
     * @example
     * var m1 = msg(options);
     *
     * // 只有一个公共方法
     * m1.destroy();
     */
    module.exports = function (options) {
        options = data.extend(!0, {}, defaults, options);

        return (new Msg(options))._init();
    };
});