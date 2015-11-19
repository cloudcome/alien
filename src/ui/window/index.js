/*!
 * window
 * @author ydr.me
 * @create 2015-01-11 14:49
 */


define(function (require, exports, module) {
    /**
     * @module ui/window/
     * @requires utils/allocation
     * @requires utils/dato
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires ui/
     */
    'use strict';

    var allocation = require('../../utils/allocation.js');
    var controller = require('../../utils/controller.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var keyframes = require('../../core/dom/keyframes.js');
    var event = require('../../core/event/base.js');
    var animation = require('../../core/dom/animation.js');
    var style = require('./style.css', 'css');
    var ui = require('../');
    var REG_AUTO_OR_100_PERCENT = /auto|100%/i;
    var alienIndex = 0;
    var alienBaseClass = 'alien-ui';
    var alienClass = alienBaseClass + '-window';
    var shakeKeyframes = keyframes.create({
        '0,1': {
            translateX: 0
        },
        '0.1,0.3,0.5,0.7,0.9': {
            translateX: -10
        },
        '0.2,0.4,0.6,0.8': {
            translateX: 10
        }
    });
    var noop = function () {
        // ignore
    };
    var $body = document.body;
    var defaults = {
        parentNode: $body,
        width: '90%',
        height: 'auto',
        top: 'center',
        right: null,
        bottom: null,
        left: 'center',
        duration: 234,
        easing: {
            open: 'ease-out-back',
            close: 'ease-in-back',
            resize: 'ease-out-back'
        },
        addClass: '',
        // 最小偏移量
        minOffset: 20,
        autoResize: true,
        // 是否自动聚焦 window
        autoFocus: true
    };
    var Window = ui.create({
        constructor: function ($content, options) {
            var the = this;

            the._$content = selector.query($content)[0];
            options = the._options = dato.extend(true, {}, defaults, options);
            the.visible = false;
            the.destroyed = false;
            the.className = 'window';
            the._id = alienIndex++;
            var $pos = modification.create('#comment', alienClass + '-' + the._id);
            var setEasing = function (options) {
                if (typeis.string(options.easing)) {
                    var e = {};

                    e.open = e.close = e.resize = options.easing;
                    options.easing = e;
                }
            };

            the._$window = modification.create('div', {
                id: alienClass + '-' + the._id,
                'class': alienClass,
                style: {
                    display: 'none'
                }
            });
            the._$focus = modification.create('input', {
                'class': alienClass + '-focus'
            });
            attribute.addClass(the._$window, options.addClass);
            modification.insert(the._$window, options.parentNode);
            modification.insert(the._$focus, the._$window);

            if (the._$content) {
                modification.insert($pos, the._$content, 'afterend');
                the._$contentPos = $pos;
                modification.insert(the._$content, the._$window);
            }

            setEasing(the._options);
            the.on('setoptions', setEasing);

            if (options.autoResize) {
                event.on(window, 'resize', the._onresize = controller.debounce(the.resize.bind(the)));
            }

            return the;
        },


        /**
         * 获得窗口的尺寸
         * @returns {{}}
         */
        getSize: function () {
            var the = this;
            var options = the._options;
            var size = {};
            var hasMask = selector.closest(the._$window, '.' + alienBaseClass + '-mask')[0];

            attribute.css(the._$window, {
                display: 'block',
                width: options.width,
                height: options.height,
                position: hasMask ? 'absolute' : 'fixed',
                scale: 1
            });
            size.width = attribute.outerWidth(the._$window);
            size.height = attribute.outerHeight(the._$window);

            if (options.width === 'height' && options.height === 'width') {
                size.width = size.height = Math.max(size.width, size.height);
                size.type = 1;
            } else if (options.width === 'height') {
                size.width = size.height;
                size.type = 2;
            } else if (options.height === 'width') {
                size.height = size.width;
                size.type = 3;
            }

            the.size = size;

            return size;
        },


        /**
         * 获取对话框要显示的位置
         * @returns {{}}
         * @private
         */
        _getPos: function () {
            var the = this;
            var options = the._options;
            var winW = attribute.width(window);
            var winH = attribute.height(window);
            var pos = {};

            if (options.left === 'center') {
                pos.left = (winW - the.size.width) / 2;
                pos.left = pos.left < 0 ? 0 : pos.left;
            } else if (options.left !== null) {
                pos.left = options.left;
            }

            if (options.top === 'center') {
                pos.top = (winH - the.size.height) * 2 / 5;
                pos.top = pos.top < options.minOffset ? options.minOffset : pos.top;
            } else if (options.top !== null) {
                pos.top = options.top;
            }

            if (options.right !== null) {
                pos.right = options.right;
            }

            if (options.bottom !== null) {
                pos.bottom = options.bottom;
            }

            return pos;
        },


        /**
         * 打开窗口
         * @param [callback] {Function} 打开之后回调
         */
        open: function (callback) {
            var the = this;

            if (the.visible) {
                return the;
            }

            if (the._$content) {
                attribute.css(the._$content, 'display', 'block');
            }

            var options = the._options;
            var onopen = function () {
                /**
                 * 窗口打开之后
                 * @event open
                 */
                the.emit('open');

                if (options.autoFocus) {
                    the._$focus.focus();
                    controller.nextTick(function () {
                        the._$focus.blur();
                    });
                }

                if (typeis.function(callback)) {
                    callback.call(the);
                }
            };

            controller.nextTick(function () {
                the.getSize();

                /**
                 * 窗口打开之前
                 * @event beforeopen
                 */
                if (the.emit('beforeopen', the.size) === false) {
                    return;
                }

                var to = the._getPos();

                switch (the.size.type) {
                    case 1:
                        to.width = the.size.width;
                        to.height = the.size.height;
                        break;

                    case 2:
                        to.width = the.size.width;
                        break;

                    case 3:
                        to.height = the.size.height;
                        break;
                }


                the.visible = true;
                dato.extend(to, {
                    opacity: 0,
                    zIndex: ui.getZindex(),
                    scale: 0.9,
                    marginTop: options.minOffset
                });
                attribute.css(the._$window, to);
                animation.transition(the._$window, {
                    scale: 1,
                    opacity: 1,
                    marginTop: 0
                }, {
                    duration: options.duration,
                    easing: options.easing.open
                }, onopen);
            });

            return the;
        },


        /**
         * 改变 window 尺寸
         * @param [size] {Object} 尺寸
         * @param [callback] {Function} 回调
         */
        resize: function (size, callback) {
            var the = this;

            callback = typeis.function(callback) ? callback : noop;

            if (!the.visible) {
                callback.call(the);
                return the;
            }

            var args = allocation.args(arguments);

            if (typeis.function(args[0])) {
                callback = args[0];
                size = null;
            }

            var options = the._options;

            dato.extend(true, options, size);

            the.getSize();
            var to = the._getPos();

            /**
             * 窗口大小改变之前
             * @event beforeresize
             */
            if (the.emit('beforeresize', the.size, to) === false) {
                return the;
            }

            animation.transition(the._$window, to, {
                duration: options.duration,
                easing: options.easing.resize
            }, function () {
                /**
                 * 窗口大小改变之后
                 * @event resize
                 */
                the.emit('afterresize');
                callback.call(the);
            });

            return the;
        },


        /**
         * 调整位置
         */
        position: function (callback) {
            var the = this;
            var options = the._options;
            var to = the._getPos();

            /**
             * 窗口位置改变之前
             * @event beforeresize
             */
            if (the.emit('beforeposition', to) === false) {
                return the;
            }

            animation.transition(the._$window, to, {
                duration: options.duration,
                easing: options.easing.resize
            }, function () {
                /**
                 * 窗口位置改变之后
                 * @event resize
                 */
                the.emit('afterposition');

                if (typeis.function(callback)) {
                    callback.call(the);
                }
            });

            return the;
        },


        /**
         * 关闭窗口
         * @param [callback] {Function} 打开之后回调
         */
        close: function (callback) {
            var the = this;

            callback = typeis.function(callback) ? callback : noop;

            if (!the.visible) {
                return the;
            }

            var options = the._options;
            var onclose = function () {
                /**
                 * 窗口关闭之后
                 * @event close
                 */
                the.emit('close');

                attribute.css(the._$window, {
                    display: 'none',
                    marginTop: 0
                });

                callback.call(the);
            };

            controller.nextTick(function () {
                /**
                 * 窗口关闭之前
                 * @event beforeclose
                 */
                if (the.emit('beforeclose') === false) {
                    return;
                }

                the.visible = false;
                animation.transition(the._$window, {
                    scale: 0.9,
                    opacity: 0,
                    marginTop: options.minOffset
                }, {
                    direction: 'reverse',
                    duration: options.duration,
                    easing: options.easing.close
                }, onclose);
            });

            return the;
        },


        /**
         * 获取当前 window 节点
         * @returns {Element}
         */
        getNode: function () {
            return this._$window;
        },


        /**
         * 设置 window 内容
         * @param html
         * @returns {Window}
         */
        setContent: function (html) {
            var the = this;

            the._$window.innerHTML = html;

            return the;
        },


        /**
         * 震晃窗口以示提醒
         */
        shake: function () {
            var the = this;

            animation.keyframes(the._$window, shakeKeyframes, {
                duration: 500
            });

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function (callback) {
            var the = this;
            var destroy = function () {
                if (the._onresize) {
                    event.on(window, 'resize', the._onresize);
                }

                if (the._$content) {
                    modification.insert(the._$content, the._$contentPos, 'afterend');
                    modification.remove(the._$contentPos);
                }

                modification.remove(the._$window);

                if (typeis.function(callback)) {
                    callback();
                }
            };

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;

            if (the.visible) {
                the.close(destroy);
                the.visible = false;
            } else {
                destroy();
            }
        }
    });

    Window.defaults = defaults;

    /**
     * 创建一个窗口实例
     * @param $content {Object} 内容节点，为 null 时创建一个新的 window
     * @param [options] {Object} 配置
     * @param [options.width="auto"] {Number|String} 窗口宽度，当 width="height" 并且 height="width"时，取 width 和 height 的最大值，并保持相等
     * @param [options.height="auto"] {Number|String} 窗口高度，当 width="height" 并且 height="width"时，取 width 和 height 的最大值，并保持相等
     * @param [options.left="center"] {Number|String} 窗口左位移
     * @param [options.top="center"] {Number|String} 窗口上位移
     * @param [options.duration=456] {Number} 窗口打开动画时间
     * @param [options.easing] {Object} 窗口动画缓冲
     * @param [options.easing.open="ease-out-back"] {String} 窗口打开动画缓冲
     * @param [options.easing.close="ease-in-back"] {String} 窗口关闭动画缓冲
     * @param [options.addClass=""] {String} 窗口添加的 className
     */
    module.exports = Window;
    ui.importStyle(style);
});