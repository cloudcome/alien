/*!
 * Msg.js
 * @author ydr.me
 * @create 2014-10-10 22:36
 */


define(function (require, exports, module) {
    /**
     * @module ui/Msg
     * @requires util/class
     * @requires util/data
     * @requires libs/Emitter
     * @requires core/event/touch
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires ui/dialog
     */
    'use strict';


    var klass = require('../util/class.js');
    var data = require('../util/data.js');
    var Emitter = require('../libs/Emitter.js');
    var event = require('../core/event/touch.js');
    var Dialog = require('./Dialog.js');
    var selector = require('../core/dom/selector.js');
    var modification = require('../core/dom/modification.js');
    var attribute = require('../core/dom/attribute.js');
    var index = 0;
    var body = document.body;
    var headerClass = 'alien-ui-msg-header';
    var titleClass = 'alien-ui-msg-title';
    var closeClass = 'alien-ui-msg-close';
    var bodyClass = 'alien-ui-msg-body';
    var buttonClass = 'alien-ui-msg-button';
    var defaults = {
        width: 300,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '提示',
        content: 'Hello world!',
        buttons: null,
        style: 'muted',
        canDrag: !0,
        timeout: -1
    };
    var mouseevent = {};
    var Msg = klass.create({
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
             * @property [style="muted"] {String} 消息框样式，内置的样式有<code>muted/info/success</code>、<code>warning/danger/error/inverse</code>
             * @property [canDrag] {Boolean} 是否允许拖拽，标题存在时拖拽标题，否则为自身，默认 true
             * @property [timeout] {Number} 消息框消失时间，默认为-1为不消失，单位 ms
             */
            defaults: defaults
        },


        constructor: function (options) {
            var the = this;

            Emitter.apply(the, arguments);
            the._options = data.extend(!0, {}, defaults, options);
            the._init();
        },


        _init: function () {
            index++;

            var the = this;
            var options = the._options;
            var msg = modification.create('div', {
                id: 'alien-ui-msg-' + index,
                'class': 'alien-ui-msg alien-ui-msg-' + options.style
            });
            var buttons = '';
            var buttonsLength = 0;
            var header;

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
                    '<div class="' + headerClass + '">' +
                    '<div class="' + titleClass + '">' + options.title + '</div>' +
                    '<div class="' + closeClass + '">&times;</div>' +
                    '</div>') +
                '<div class="' + bodyClass + '">' + options.content + '</div>' +
                buttons;

            modification.insert(msg, body, 'beforeend');
            the._dialog = new Dialog(msg, {
                width: options.width,
                height: options.height,
                left: options.left,
                top: options.top,
                isWrap: !1,
                title: null
            }).init().open();

            if (options.canDrag) {
                if (options.title) {
                    header = selector.query('.' + headerClass, msg)[0];
                    attribute.attr(header, 'draggablefor', 'alien-ui-dialog-' + the._dialog._id);
                } else {
                    attribute.attr(msg, 'draggablefor', 'alien-ui-dialog-' + the._dialog._id);
                }
            }

            the._timerId = 0;
            the._timeout();
            the._event();
            the._msg = msg;
            the._body = selector.query('.' + bodyClass, the._msg)[0];
            the._id = index;

            return the;
        },

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
                    var x1 = x0 + attribute.width(dialog);
                    var y1 = y0 + attribute.height(dialog);
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
            event.on(the._dialog._dialog, 'click tap', '.' + closeClass, function () {
                the.destroy();
                the.emit('close', -1);
            });

            // 点击按钮响应事件
            event.on(the._dialog._dialog, 'click tap', '.' + buttonClass, function (eve) {
                var index = selector.index(eve.target);

                the.destroy();
                the.emit('close', index);
            });

            // 鼠标进入、离开
            if (the._options.timeout > 0) {
                event.on(the._dialog._dialog, 'mouseover dragstart drag', function () {
                    if (the._timerId) {
                        clearTimeout(the._timerId);
                        the._timerId = 0;
                    }
                });

                event.on(the._dialog._dialog, 'mouseout dragend', function () {
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
                the._body.innerHTML = the._options.content = String(content);
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
                modification.remove(the._msg);
            });
        }
    }, Emitter);
    var style =
        // 包装
        '.alien-ui-msg{box-shadow:0 0 20px #666;border-radius:6px;color:#FFF;overflow:hidden}' +
        // 标题
        '.alien-ui-msg-header{position:relative;font-weight:normal;overflow:hidden}' +
        '.alien-ui-msg-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:10px;font-size:12px;text-align:center;line-height:12px;cursor:move;color:#fff}' +
        '.alien-ui-msg-close{position:absolute;top:0;right:0;color:#eee;width:32px;height:32px;text-align:center;cursor:pointer;font:normal normal normal 30px/32px Arial}' +
        '.alien-ui-msg-close:hover{color:#fff}' +
        '.alien-ui-msg-body{padding:30px;word-break:break-word;line-height:22px;font-size:16px}' +
        // 按钮
        '.alien-ui-msg-buttons{border-top:1px solid;overflow:hidden}' +
        '.alien-ui-msg-button{float:left;width:100%;height:36px;line-height:36px;text-align:center;cursor:pointer;font-size:14px}' +
        '.alien-ui-msg-buttons-horizontal .alien-ui-msg-button{border-left:1px solid;margin-left:-1px}' +
        '.alien-ui-msg-buttons-vertical .alien-ui-msg-button{border-top:1px solid}' +
        '.alien-ui-msg-buttons-2 .alien-ui-msg-button{width:50%}' +
        '.alien-ui-msg-buttons-3 .alien-ui-msg-button{width:33.3333333333%}' +
        '.alien-ui-msg-buttons .alien-ui-msg-button-0{border-top:0;border-left:0;margin-left:0}' +
        // muted
        '.alien-ui-msg-muted{background:#F8F8F8;background:-moz-linear-gradient(#FFF 0, #EEE 100%);background:-webkit-linear-gradient(#FFF 0, #EEE 100%);background:-o-linear-gradient(#FFF 0, #EEE 100%);background:-ms-linear-gradient(#FFF 0, #EEE 100%);background:linear-gradient(#FFF 0, #EEE 100%);color:#666}' +
        '.alien-ui-msg-muted .alien-ui-msg-title{color:#888}' +
        '.alien-ui-msg-muted .alien-ui-msg-close{color:#ccc}' +
        '.alien-ui-msg-muted .alien-ui-msg-close:hover{color:#888}' +
        '.alien-ui-msg-muted .alien-ui-msg-buttons,.alien-ui-msg-muted .alien-ui-msg-button{border-color:#DDD}' +
        '.alien-ui-msg-muted .alien-ui-msg-button:hover{background:#ECECEC}' +
        '.alien-ui-msg-muted .alien-ui-msg-button:active{background:#E2E2E2}' +
        // success
        '.alien-ui-msg-success{text-shadow:0 1px 0 #1B911B;background:#42AF42;background:-moz-linear-gradient(#68D368 0, #419641 100%);background:-webkit-linear-gradient(#68D368 0, #419641 100%);background:-o-linear-gradient(#68D368 0, #419641 100%);background:-ms-linear-gradient(#68D368 0, #419641 100%);background:linear-gradient(#68D368 0, #419641 100%)}' +
        '.alien-ui-msg-success .alien-ui-msg-buttons,.alien-ui-msg-success .alien-ui-msg-button{border-color:#279222}' +
        '.alien-ui-msg-success .alien-ui-msg-button:hover{background:#339B2E}' +
        '.alien-ui-msg-success .alien-ui-msg-button:active{background:#299424}' +
        // info
        '.alien-ui-msg-info{text-shadow:0 1px 0 #2B9DC0;background:#28ABD3;background:-moz-linear-gradient(#6BCDEB 0, #2499BD 100%);background:-webkit-linear-gradient(#6BCDEB 0, #2499BD 100%);background:-o-linear-gradient(#6BCDEB 0, #2499BD 100%);background:-ms-linear-gradient(#6BCDEB 0, #2499BD 100%);background:linear-gradient(#6BCDEB 0, #2499BD 100%)}' +
        '.alien-ui-msg-info .alien-ui-msg-buttons,.alien-ui-msg-info .alien-ui-msg-button{border-color:#218EAF}' +
        '.alien-ui-msg-info .alien-ui-msg-button:hover{background:#2499BD}' +
        '.alien-ui-msg-info .alien-ui-msg-button:active{background:#2396B9}' +
        // warning
        '.alien-ui-msg-warning{text-shadow:0 1px 0 #CC551E;background:#F17840;background:-moz-linear-gradient(#FAB190 0, #DF5B1E 100%);background:-webkit-linear-gradient(#FAB190 0, #DF5B1E 100%);background:-o-linear-gradient(#FAB190 0, #DF5B1E 100%);background:-ms-linear-gradient(#FAB190 0, #DF5B1E 100%);background:linear-gradient(#FAB190 0, #DF5B1E 100%)}' +
        '.alien-ui-msg-warning .alien-ui-msg-buttons,.alien-ui-msg-warning .alien-ui-msg-button{border-color:#D6571C}' +
        '.alien-ui-msg-warning .alien-ui-msg-button:hover{background:#E26023}' +
        '.alien-ui-msg-warning .alien-ui-msg-button:active{background:#D65619}' +
        // error danger
        '.alien-ui-msg-error,.alien-ui-msg-danger{text-shadow:0 1px 0 #8B0A07;background:#D54A46;background:-moz-linear-gradient(#E4635F 0, #c12e2a 100%);background:-webkit-linear-gradient(#E4635F 0, #c12e2a 100%);background:-o-linear-gradient(#E4635F 0, #c12e2a 100%);background:-ms-linear-gradient(#E4635F 0, #c12e2a 100%);background:linear-gradient(#E4635F 0, #c12e2a 100%)}' +
        '.alien-ui-msg-error .alien-ui-msg-buttons,.alien-ui-msg-error .alien-ui-msg-button,.alien-ui-msg-danger .alien-ui-msg-buttons,.alien-ui-msg-danger .alien-ui-msg-button{border-color:#AD2222}' +
        '.alien-ui-msg-error .alien-ui-msg-button:hover,.alien-ui-msg-danger .alien-ui-msg-button:hover{background:#B92C2C}' +
        '.alien-ui-msg-error .alien-ui-msg-button:active,.alien-ui-msg-danger .alien-ui-msg-button:active{background:#B12525}' +
        // inverse
        '.alien-ui-msg-inverse{text-shadow:0 1px 0 #000;background:#6F6F6F;background:-moz-linear-gradient(#9B9B9B 0, #585858 100%);background:-webkit-linear-gradient(#9B9B9B 0, #585858 100%);background:-o-linear-gradient(#9B9B9B 0, #585858 100%);background:-ms-linear-gradient(#9B9B9B 0, #585858 100%);background:linear-gradient(#9B9B9B 0, #585858 100%)}' +
        '.alien-ui-msg-inverse .alien-ui-msg-buttons,.alien-ui-msg-inverse .alien-ui-msg-button{border-color:#505050}' +
        '.alien-ui-msg-inverse .alien-ui-msg-button:hover{background:#555555}' +
        '.alien-ui-msg-inverse .alien-ui-msg-button:active{background:#464646}';

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
     * @param [options.buttons=null] {Array|null} 消息框按钮数组，如：<code>["确定", "取消"]</code>
     * @param [options.style="muted"] {String} 消息框样式，内置的样式有<code>muted/info/success</code>、<code>warning/danger/error/inverse</code>
     * @param [options.canDrag] {Boolean} 是否允许拖拽，标题存在时拖拽标题，否则为自身，默认 true
     * @param [options.timeout] {Number} 消息框消失时间，默认为-1为不消失，单位 ms
     * @constructor
     */
    module.exports = Msg;
});