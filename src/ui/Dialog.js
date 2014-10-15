/*!
 * Dialog.js
 * @author ydr.me
 * @create 2014-10-10 22:36
 */


define(function (require, exports, module) {
    /**
     * @module ui/Dialog
     * @requires util/class
     * @requires util/data
     * @requires core/dom/modification
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/animation
     * @requires core/event/touch
     * @requires core/event/drag
     *
     * @author ydr.me
     * @create 2014-10-04 02:33
     */

    'use strict';

    require('../core/event/drag.js');
    var klass = require('../util/class.js');
    var Emitter = require('../libs/Emitter.js');
    var modification = require('../core/dom/modification.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var animation = require('../core/dom/animation.js');
    var event = require('../core/event/touch.js');
    var data = require('../util/data.js');
    var index = 0;
    var zIndex = 9999;
//    var html = document.documentElement;
    var body = document.body;
    var overflowClass = 'alien-ui-dialog-overflow';
    var dialogClass = 'alien-ui-dialog';
    var bodyClass = 'alien-ui-dialog-body';
    var titleClass = 'alien-ui-dialog-title';
    var closeClass = 'alien-ui-dialog-close';
    var iframeClass = 'alien-ui-dialog-iframe';
    var shakeClass = 'alien-ui-dialog-shake';
    var defaults = {
        width: 500,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '无标题对话框',
        canDrag: !0,
        duration: 345,
        easing: 'ease-in-out-back',
        // 优先级2
        remote: null,
        remoteHeight: 400,
        // 优先级1
        content: null,
        // 优先级1
        isWrap: !0
    };
    // 打开的对话框队列
    var openDialogs = [];
    var dialogsMap = {};
    var Dialog = klass.create({
        STATIC: {
            /**
             * 默认配置
             * @name defaults
             * @property [width=500] {Number|String} 对话框宽度
             * @property [height="auto"] {Number|String} 对话框高度
             * @property [left="center"] {Number|String} 对话框左距离，默认水平居中
             * @property [top="center"] {Number|String} 对话框上距离，默认垂直居中（为了美观，表现为2/5处）
             * @property [title="无标题对话框"] {String|null} 对话框标题，为null时将隐藏标题栏
             * @property [canDrag=true] {Boolean} 对话框是否可以被拖拽，标题栏存在时拖动标题栏，否则拖拽整体
             * @property [duration=345] {Number} 对话框打开、关闭的动画时间，单位毫秒
             * @property [easing="ease-in-out-back"] {String} 对话框打开、关闭的动画缓冲函数
             * @property [remote=null] {null|String} 对话框打开远程地址，优先级2
             * @property [remoteHeight=400] {Number} 对话框打开远程地址的高度，单位像素
             * @property [content=null] {null|HTMLElement|Node|String} 设置对话框的内容，优先级1
             * @property [isWrap=true] {Boolean} 是否自动包裹对话框来，默认 true，优先级1

             */
            defaults: defaults
        },

        constructor: function (ele, options) {
            var the = this;


            the._ele = selector.query(ele);

            if(!the._ele.length){
                throw new Error('instance element is empty');
            }

            the._ele = the._ele[0];
            Emitter.apply(the, arguments);
            the._options = data.extend(!0, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @returns {Dialog}
         * @private
         */
        _init: function () {
            index++;

            var the = this;
            var options = the._options;
            var bg = modification.create('div', {
                id: 'alien-ui-dialog-bg-' + index,
                'class': 'alien-ui-dialog-bg'
            });
            var dialog = modification.create('div', {
                id: 'alien-ui-dialog-' + index,
                'class': dialogClass,
                role: 'dialog',
                draggablefor: options.title === null && options.canDrag ? 'alien-ui-dialog-' + index : ''
            });
            var bd;

            if (options.isWrap) {
                dialog.innerHTML = '<div class="alien-ui-dialog-container">' +
                    (options.title === null ? '' :
                        '<div class="alien-ui-dialog-header"' +
                        (options.canDrag ? ' draggablefor="alien-ui-dialog-' + index + '"' : '') +
                        '>' +
                        '<div class="' + titleClass + '">' + options.title + '</div>' +
                        '<div class="' + closeClass + '">&times;</div>' +
                        '</div>') +
                    '<div class="' + bodyClass + '"></div>' +
                    '</div>';
                bd = selector.query('.' + bodyClass, dialog)[0];
            }

            modification.insert(bg, body, 'beforeend');
            modification.insert(dialog, bg, 'beforeend');
            the._bg = bg;

            the._dialog = dialog;
            the._hasOpen = !1;
            the._zIndex = 0;
            the._id = index;
            dialogsMap[the._id] = the;

            modification.insert(the._ele, bd ? bd : dialog, 'beforeend');

            event.on(dialog, 'click tap', '.' + closeClass, function () {
                the.close();
            });

            event.on(the._bg, 'click tap', function (eve) {
                eve.stopPropagation();

                if (!selector.closest(eve.target, '.' + dialogClass).length) {
                    the.shake();
                }
            });

            return the;
        },

        /**
         * 打开对话框
         * @param {Function} [callback] 打开之后回调
         * @returns {Dialog}
         */
        open: function (callback) {
            var the = this;
            var bg = the._bg;
            var dialog = the._dialog;
            var to;
            var options = the._options;
            var findIndex;

            if (the._hasOpen) {
                return the;
            }

            the._hasOpen = !0;
            findIndex = openDialogs.indexOf(the._id);

            if (findIndex > -1) {
                openDialogs.splice(findIndex, 1);
            }

            openDialogs.push(the._id);
            attribute.addClass(body, overflowClass);

            if (options.content || options.remote) {
                the._ele.innerHTML = '';
            }

            attribute.css(bg, {
                display: 'block',
                zIndex: ++zIndex,
                opacity: 0
            });

            attribute.css(dialog, {
                display: 'block',
                visibility: 'hidden',
                width: options.width,
                height: options.height
            });

            the._zIndex = zIndex;
            to = the._position();
            to.opacity = '';
            to.transform = 'scale(1)';

            attribute.css(dialog, {
                opacity: 0,
                visibility: 'visible',
                left: to.left,
                top: to.top,
                transform: 'scale(0)'
            });

            animation.animate(bg, {
                opacity: 1
            }, {
                duration: options.duration,
                easing: options.easing
            });

            animation.animate(dialog, to, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                the.emit('open');

                if (!options.content && options.remote) {
                    the.setRemote(options.remote);
                }

                if (data.type(callback) === 'function') {
                    callback.call(the);
                }
            });

            if (options.content) {
                the.setContent(options.content);
            }

            return the;
        },


        /**
         * 关闭对话框
         * @param {Function} [callback] 打开之后回调
         * @returns {Dialog}
         */
        close: function (callback) {
            var the = this;
            var bg = the._bg;
            var dialog = the._dialog;
            var options = the._options;
//            var theH = attribute.height(dialog);

            if (!the._hasOpen) {
                return the;
            }

            the._hasOpen = !1;
            openDialogs.pop();

            if (!openDialogs.length) {
                attribute.removeClass(body, overflowClass);
            }

            animation.animate(dialog, {
                opacity: 0,
                transform: 'scale(0)'
            }, {
                duration: options.duration,
                easing: options.easing
            });

            animation.animate(bg, {
                opacity: 0
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                attribute.css(bg, 'display', 'none');
                attribute.css(dialog, 'transform', 'scale(1)');
                the.emit('close');

                if (data.type(callback) === 'function') {
                    callback.call(the);
                }
            });

            return the;
        },


        /**
         * 重新定位对话框
         * @param {Function} [callback] 打开之后回调
         * @returns {Dialog}
         */
        position: function (callback) {
            var the = this;
            var options = the._options;
            var pos = the._position();

            animation.animate(the._dialog, pos, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                if (data.type(callback) === 'function') {
                    callback.call(the);
                }
            });

            return the;
        },


        /**
         * 对话框添加内容，并重新定位
         * @returns {Dialog}
         */
        setContent: function (content) {
            var the = this;
            var contentType = data.type(content);

            the._ele.innerHTML = '';

            if (contentType === 'string') {
                content = modification.create('#text', content);
            }

            modification.insert(content, the._ele, 'beforeend');
            the.position();

            return the;
        },


        /**
         * 对话框添加远程地址，并重新定位
         * @param {String} url 远程地址
         * @param {Number} [height=400] 高度
         * @returns {Dialog}
         */
        setRemote: function (url, height) {

            var the = this;
            var options = the._options;
            var iframe = modification.create('iframe', {
                src: url,
                'class': iframeClass,
                style: {
                    height: height || options.remoteHeight
                }
            });

            the._ele.innerHTML = '';
            modification.insert(iframe, the._ele, 'beforeend');
            the.position();

            return the;
        },


        /**
         * 晃动对话框以示提醒
         * @returns {Dialog}
         */
        shake: function () {
            var the = this;

            if (the.shakeTimeid) {
                the.shakeTimeid = 0;
                clearTimeout(the.shakeTimeid);
                attribute.removeClass(the._dialog, shakeClass);
            }

            attribute.addClass(the._dialog, shakeClass);

            the.shakeTimeid = setTimeout(function () {
                attribute.removeClass(the._dialog, shakeClass);
            }, 500);

            return the;
        },


        /**
         * 销毁对话框
         * @param {Function} [callback] 打开之后回调
         */
        destroy: function (callback) {
            var the = this;

            // 关闭对话框
            the.close(function () {
                // 从对话框 map 里删除
                delete(dialogsMap[the._id]);


                // 将内容放到 body 里
                modification.insert(the._ele, body, 'beforeend');

                // 移除事件监听
                event.un(the._dialog, 'click tap');
                event.un(the._bg, 'click tap');

                // 在 DOM 里删除
                modification.remove(the._bg);

                if (data.type(callback) === 'function') {
                    callback.call(the);
                }
            });
        },


        /**
         * 获取对话框需要定位的终点位置
         * @returns {Object}
         * @type {{width:Number,height:Number,left:Number,top:Number}}
         * @private
         */
        _position: function () {
            var the = this;
            var options = the._options;
            var winW = attribute.width(window);
            var winH = attribute.height(window);
            var pos = {};

            animation.stop(the._dialog, !0);

            attribute.css(the._dialog, {
                width: options.width,
                height: options.height
            });

            pos.width = attribute.width(the._dialog);
            pos.height = attribute.height(the._dialog);

            if (options.left === 'center') {
                pos.left = (winW - pos.width) / 2;
                pos.left = pos.left < 0 ? 0 : pos.left;
            } else {
                pos.left = options.left;
            }

            if (options.top === 'center') {
                pos.top = (winH - pos.height) * 2 / 5;
                pos.top = pos.top < 0 ? 0 : pos.top;
            } else {
                pos.top = options.top;
            }

            return pos;
        }
    }, Emitter);
    var style =
        // 外层
        '.alien-ui-dialog-overflow{position:relative;width:100%;overflow:hidden}' +
        // 背景
        '.alien-ui-dialog-bg{display:none;position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(255,255,255,.3);overflow:auto;-webkit-overflow-scrolling:touch}' +
        '.alien-ui-dialog{position:absolute;width:500px;background:#fff}' +
        '.alien-ui-dialog-container{box-shadow:0 0 20px #A0A0A0;height:100%;overflow:hidden}' +
        // 标题
        '.alien-ui-dialog-header{position:relative;font-weight:normal;overflow:hidden;background:-moz-linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%);background:-webkit-linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%);background:-o-linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%);background:-ms-linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%);background:linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%)}' +
        '.alien-ui-dialog-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:10px;font-size:12px;text-align:center;line-height:12px;cursor:move;color:#444}' +
        '.alien-ui-dialog-close{position:absolute;top:0;right:0;color:#ccc;width:32px;height:32px;text-align:center;cursor:pointer;font:normal normal normal 30px/32px Arial}' +
        '.alien-ui-dialog-close:hover{color:#888}' +
        '.alien-ui-dialog-body{position:relative;padding:20px;overflow:auto}' +
        '.alien-ui-dialog-iframe{display:block;border:0;margin:0;padding:0;width:100%;height:400px}' +
        // shake
        '@-webkit-keyframes alien-ui-dialog-shake {0%, 100% {-webkit-transform:translateX(0)}10%, 30%, 50%, 70%, 90% {-webkit-transform:translateX(-10px)}20%, 40%, 60%, 80% {-webkit-transform:translateX(10px)}}' +
        '@-moz-keyframes alien-ui-dialog-shake {0%, 100% {-moz-transform:translateX(0)}10%, 30%, 50%, 70%, 90% {-moz-transform:translateX(-10px)}20%, 40%, 60%, 80% {-moz-transform:translateX(10px)}}' +
        '@-o-keyframes alien-ui-dialog-shake {0%, 100% {-o-transform:translateX(0)}10%, 30%, 50%, 70%, 90% {-o-transform:translateX(-10px)}20%, 40%, 60%, 80% {-o-transform:translateX(10px)}}' +
        '@keyframes alien-ui-dialog-shake {0%, 100% {transform:translateX(0)}10%, 30%, 50%, 70%, 90% {transform:translateX(-10px)}20%, 40%, 60%, 80% {transform:translateX(10px)}}' +
        '.alien-ui-dialog-shake{-webkit-animation:both 500ms alien-ui-dialog-shake;-moz-animation:both 500ms alien-ui-dialog-shake;-ms-animation:both 500ms alien-ui-dialog-shake;-o-animation:both 500ms alien-ui-dialog-shake;animation:both 500ms alien-ui-dialog-shake}';

    modification.importStyle(style);

    event.on(document, 'keyup', function (eve) {
        var d;

        if (eve.which === 27 && openDialogs.length) {
            d = dialogsMap[openDialogs[openDialogs.length - 1]];

            if (d && d.constructor === Dialog) {
                d.shake();
            }
        }
    });

    /**
     * 实例化一个模态交互对话框
     *
     * @param ele {HTMLElement|Node} 元素
     * @param [options] {Object}
     * @param [options.width=500] {Number|String} 对话框宽度
     * @param [options.height="auto"] {Number|String} 对话框高度
     * @param [options.left="center"] {Number|String} 对话框左距离，默认水平居中
     * @param [options.top="center"] {Number|String} 对话框上距离，默认垂直居中（为了美观，表现为2/5处）
     * @param [options.title="无标题对话框"] {String|null} 对话框标题，为null时将隐藏标题栏
     * @param [options.canDrag=true] {Boolean} 对话框是否可以被拖拽，标题栏存在时拖动标题栏，否则拖拽整体
     * @param [options.duration=345] {Number} 对话框打开、关闭的动画时间，单位毫秒
     * @param [options.easing="ease-in-out-back"] {String} 对话框打开、关闭的动画缓冲函数
     * @param [options.remote=null] {null|String} 对话框打开远程地址，优先级2
     * @param [options.remoteHeight=400] {Number} 对话框打开远程地址的高度，单位像素
     * @param [options.content=null] {null|HTMLElement|Node|String} 设置对话框的内容，优先级1
     * @param [options.isWrap=true] {Boolean} 是否自动包裹对话框来，默认 true，优先级1
     * @constructor
     */
    module.exports = Dialog;
});