/*!
 * Dialog.js
 * @author ydr.me
 * @create 2014-10-10 22:36
 */


define(function (require, exports, module) {
    /**
     * @module ui/Dialog/index
     * @requires ui/generator
     * @requires libs/Template
     * @requires core/dom/modification
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/animation
     * @requires core/event/touch
     * @requires util/dato
     * @requires util/typeis
     *
     * @author ydr.me
     * @create 2014-10-04 02:33
     */

    'use strict';


    require('../../core/event/drag.js');
    var style = require('css!./style.css');
    var template = require('html!./template.html');
    var generator = require('../generator.js');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var modification = require('../../core/dom/modification.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/touch.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var alienIndex = 0;
    var zIndex = 9999;
    var body = document.body;
    var alienClass = 'alien-ui-dialog';
    var scrollbarWidth = _getScrollWidth();
    // http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    var animationendEventType = 'animationend webkitAnimationEnd oanimationend MSAnimationEnd';
    var defaults = {
        width: 500,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '无标题对话框',
        canDrag: true,
        hideClose: false,
        duration: 345,
        easing: 'ease-in-out-back',
        addClass: '',
        // 优先级2
        remote: null,
        remoteHeight: 400,
        // 优先级1
        content: null,
        // 优先级1
        isWrap: true,
        isModal: true
    };
    // 打开的对话框队列
    var openDialogs = [];
    var dialogsMap = {};
    var Dialog = generator({
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
             * @property [isModal=true] {Boolean} 是否模态，默认 true
             */
            defaults: defaults
        },

        constructor: function (ele, options) {
            var the = this;

            the._$ele = selector.query(ele);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._id = alienIndex++;
            the._$ele = the._$ele[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @returns {Dialog}
         * @private
         */
        _init: function () {
            var the = this;

            the._hasOpen = false;
            the._zIndex = 0;
            dialogsMap[the._id] = the;
            the._initNode();
            the._initEvent();

            return the;
        },


        /**
         * 初始化节点
         * @returns {Dialog}
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var dialogData = {
                hideClose: options.hideClose,
                id: the._id,
                title: options.title,
                isWrap: options.isWrap,
                isModal: options.isModal,
                canDrag: options.canDrag
            };
            var $tpl = modification.parse(tpl.render(dialogData))[0];
            var $bg = options.isModal ? $tpl : null;
            var $bd;
            var $dialog = options.isModal ? selector.query('.' + alienClass, $bg)[0] : $tpl;

            modification.insert($bg ? $bg : $dialog, body, 'beforeend');

            if (options.isWrap) {
                $dialog = $dialog ? $dialog : selector.query('.' + alienClass, $bg)[0];
                $bd = selector.query('.' + alienClass + '-body', $dialog)[0];
            }

            the._$bg = $bg;
            the._$bd = $bd;
            the._$dialog = $dialog;
            the._$title = selector.query('.' + alienClass + '-title', $dialog)[0];
            attribute.addClass($dialog, options.addClass);
            modification.insert(the._$ele, $bd ? $bd : $dialog, 'beforeend');
        },


        /**
         * 初始化事件
         * @returns {Dialog}
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;
            var $dialog = the._$dialog;
            var $bg = the._$bg;

            event.on($dialog, 'click tap', '.' + alienClass + '-close', function () {
                the.close();
            });

            event.on($bg, 'click tap', function (eve) {
                eve.stopPropagation();

                if (!selector.closest(eve.target, '.' + alienClass).length) {
                    the.shake();
                }
            });

            if (options.isModal) {
                event.on(window, animationendEventType, function () {
                    attribute.removeClass(the._$dialog, alienClass + '-shake');
                });
            }
        },


        /**
         * 打开对话框
         * @param {Function} [callback] 打开之后回调
         * @returns {Dialog}
         */
        open: function (callback) {
            var the = this;
            var $bg = the._$bg;
            var $dialog = the._$dialog;
            var to;
            var options = the._options;
            var findIndex;
            var dialogStyle = {
                display: 'block',
                visibility: 'hidden',
                width: options.width,
                height: options.height
            };

            if (the._hasOpen) {
                return the;
            }

            the._hasOpen = true;
            findIndex = openDialogs.indexOf(the._id);

            if (findIndex > -1) {
                openDialogs.splice(findIndex, 1);
            }

            openDialogs.push(the._id);

            if (options.isModal) {
                attribute.addClass(body, alienClass + '-overflow');
            }

            if (options.content || options.remote) {
                the._$ele.innerHTML = '';
            }

            if ($bg) {
                attribute.css($bg, {
                    display: 'block',
                    zIndex: ++zIndex,
                    opacity: 0
                });
            } else {
                dialogStyle.zIndex = ++zIndex;
            }

            attribute.css($dialog, dialogStyle);
            the._zIndex = zIndex;
            to = the._position();
            to.opacity = '';
            to.transform = '';

            attribute.css($dialog, {
                opacity: 0,
                visibility: 'visible',
                left: to.left,
                top: to.top,
                scale: 0
            });

            if ($bg) {
                animation.animate($bg, {
                    opacity: 1
                }, {
                    duration: options.duration,
                    easing: options.easing
                });
            }

            animation.animate($dialog, to, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                the.emit('open');

                if (!options.content && options.remote) {
                    the.setRemote(options.remote);
                }

                if (typeis(callback) === 'function') {
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
            var $bg = the._$bg;
            var $dialog = the._$dialog;
            var options = the._options;
            var findModal = false;
            var index = openDialogs.length - 2;
            var findIndex = -1;

            if (!the._hasOpen) {
                return the;
            }

            the._hasOpen = false;

            dato.each(openDialogs, function (index, id) {
                if (id === the._id) {
                    findIndex = index;
                    return false;
                }
            });

            openDialogs.splice(findIndex, 1);

            for (; index >= 0; index--) {
                if (dialogsMap[openDialogs[index]]._options.isModal) {
                    findModal = true;
                    break;
                }
            }

            if (!findModal) {
                attribute.removeClass(body, alienClass + '-overflow');
            }

            if ($bg) {
                animation.stop($bg);
                animation.animate($bg, {
                    opacity: 0
                }, {
                    duration: options.duration,
                    easing: options.easing
                }, function () {
                    attribute.css($bg, 'display', 'none');
                });
            }

            animation.stop($dialog);
            animation.animate($dialog, {
                opacity: 0,
                scale: 0
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                attribute.css($dialog, {
                    scale: 1,
                    display: 'none'
                });
                the.emit('close');

                if (typeis(callback) === 'function') {
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

            animation.animate(the._$dialog, pos, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                if (typeis(callback) === 'function') {
                    callback.call(the);
                }
            });

            return the;
        },


        /**
         * 设置对话框标题
         * @param title {String}
         */
        setTitle: function (title) {
            var the = this;

            the._options.title = title;

            if (the._$title) {
                the._$title.innerHTML = title;
            }
        },


        /**
         * 对话框添加内容，并重新定位
         * @param content {String}
         */
        setContent: function (content) {
            var the = this;
            var contentType = typeis(content);

            the._$ele.innerHTML = '';

            if (contentType === 'string') {
                content = modification.create('#text', content);
            }

            modification.insert(content, the._$ele, 'beforeend');
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
            var $iframe = modification.create('iframe', {
                src: url,
                'class': alienClass + '-iframe',
                style: {
                    height: height || options.remoteHeight
                }
            });

            the._$ele.innerHTML = '';
            modification.insert($iframe, the._$ele, 'beforeend');
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
                attribute.removeClass(the._$dialog, alienClass + '-shake');
            }

            attribute.addClass(the._$dialog, alienClass + '-shake');

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
                modification.insert(the._$ele, body, 'beforeend');

                // 移除事件监听
                event.un(the._$dialog, 'click tap');
                event.un(the._$bg, 'click tap');
                event.un(the._$dialog, animationendEventType);

                // 在 DOM 里删除
                modification.remove(the._$bg);

                if (typeis(callback) === 'function') {
                    callback.call(the);
                }
            });
        },


        /**
         * 获取对话框需要定位的终点位置
         * @returns {Object}
         * @private
         */
        _position: function () {
            var the = this;
            var options = the._options;
            var winW = attribute.width(window);
            var winH = attribute.height(window);
            var pos = {};

            animation.stop(the._$dialog, true);

            attribute.css(the._$dialog, {
                width: options.width,
                height: options.height
            });

            pos.width = attribute.outerWidth(the._$dialog);
            pos.height = attribute.outerHeight(the._$dialog);

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
    });


    style += '.alien-ui-dialog-overflow{padding-right:' + scrollbarWidth + 'px;}';
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
     * 获取当前页面的滚动条宽度
     * @return {Number}
     */
    function _getScrollWidth() {
        var $div = modification.create('div', {
            style: {
                width: 100,
                height: 100,
                position: 'absolute',
                padding: 0,
                margin: 0,
                overflow: 'scroll'
            }
        });
        var clientWidth;

        modification.insert($div, body, 'beforeend');
        clientWidth = $div.clientWidth;
        modification.remove($div);

        return 100 - clientWidth;
    }

    /**
     * 实例化一个模态交互对话框
     *
     * @param ele {HTMLElement|Node|String} 元素或选择器
     * @param [options] {Object}
     * @param [options.width=500] {Number|String} 对话框宽度
     * @param [options.height="auto"] {Number|String} 对话框高度
     * @param [options.left="center"] {Number|String} 对话框左距离，默认水平居中
     * @param [options.top="center"] {Number|String} 对话框上距离，默认垂直居中（为了美观，表现为2/5处）
     * @param [options.title="无标题对话框"] {String|null} 对话框标题，为null时将隐藏标题栏
     * @param [options.canDrag=true] {Boolean} 对话框是否可以被拖拽，标题栏存在时拖动标题栏，否则拖拽整体
     * @param [options.duration=345] {Number} 对话框打开、关闭的动画时间，单位毫秒
     * @param [options.easing="ease-in-out-back"] {String} 对话框打开、关闭的动画缓冲函数
     * @param [options.addClass=""] {String} 对话框添加的 className
     * @param [options.remote=null] {null|String} 对话框打开远程地址，优先级2
     * @param [options.remoteHeight=400] {Number} 对话框打开远程地址的高度，单位像素
     * @param [options.content=null] {null|HTMLElement|Node|String} 设置对话框的内容，优先级1
     * @param [options.isWrap=true] {Boolean} 是否自动包裹对话框来，默认 true，优先级1
     * @constructor
     */
    module.exports = Dialog;
});