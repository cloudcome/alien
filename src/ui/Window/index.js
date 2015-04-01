/*!
 * window
 * @author ydr.me
 * @create 2015-01-11 14:49
 */


define(function (require, exports, module) {
    /**
     * @module ui/Window/
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
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var keyframes = require('../../utils/keyframes.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/base.js');
    var animation = require('../../core/dom/animation.js');
    var style = require('css!./style.css');
    var ui = require('../');
    var alienIndex = 0;
    var alienBaseClass = 'alien-ui';
    var alienClass = alienBaseClass + '-window';
    var noop = function () {
        // ignore
    };
    var windowKeyframes = keyframes({
        0: {
            opacity: 0,
            scale: 0.6
        },
        0.8: {
            opacity: 1,
            scale: 1.1
        },
        1: {
            opacity: 1,
            scale: 1
        }
    });
    var defaults = {
        parentNode: document.body,
        width: 500,
        height: 'auto',
        top: 'center',
        right: null,
        bottom: null,
        left: 'center',
        duration: 234,
        easing: 'ease-in-out-back',
        addClass: '',
        // 最小偏移量
        minOffset: 20,
        zIndex: null,
        keyframes: null
    };
    var Window = ui.create(function ($content, options) {
        var the = this;

        the._$content = selector.query($content)[0];
        the._options = dato.extend(true, {}, defaults, options);
        the.visible = false;
        the._init();
    });


    Window.fn._init = function () {
        var the = this;
        var options = the._options;
        var $pos = modification.create('div');

        the.id = alienIndex;
        the._keyframes = options.keyframes ? keyframes(options.keyframes) : windowKeyframes;
        the._$window = modification.create('div', {
            id: alienClass + '-' + alienIndex++,
            class: alienClass,
            style: {
                display: 'none',
                position: 'absolute'
            }
        });
        attribute.addClass(the._$window, options.addClass);
        modification.insert(the._$window, options.parentNode);

        if (the._$content) {
            modification.insert($pos, the._$content, 'afterend');
            the._$contentPos = $pos;
            modification.insert(the._$content, the._$window);
        }

        the.on('setoptions', function (options) {
            the._keyframes = keyframes(options.keyframes);
        });

        return the;
    };


    /**
     * 获取对话框要显示的位置
     * @returns {{}}
     * @private
     */
    Window.fn._getPos = function () {
        var the = this;
        var options = the._options;
        var winW = attribute.width(window);
        var winH = attribute.height(window);
        var pos = {};
        var pre = attribute.css(the._$window, ['width', 'height']);
        var hasMask = selector.closest(the._$window, '.' + alienBaseClass + '-mask')[0];

        attribute.css(the._$window, {
            width: options.width,
            height: options.height,
            position: hasMask ? 'absolute' : 'fixed'
        });
        pos.width = attribute.outerWidth(the._$window);
        pos.height = attribute.outerHeight(the._$window);

        if (options.width === 'height' && options.height === 'width') {
            pos.width = pos.height = Math.max(pos.width, pos.height);
        } else if (options.width === 'height') {
            pos.width = pos.height;
        } else if (options.height === 'width') {
            pos.height = pos.width;
        }

        attribute.css(the._$window, pre);

        if (options.left === 'center') {
            pos.left = (winW - pos.width) / 2;
            pos.left = pos.left < 0 ? 0 : pos.left;
        } else if (options.left !== null) {
            pos.left = options.left;
        }

        if (options.top === 'center') {
            pos.top = (winH - pos.height) * 2 / 5;
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
    };


    /**
     * 打开窗口
     * @param [callback] {Function} 打开之后回调
     */
    Window.fn.open = function (callback) {
        var the = this;

        if (the.visible) {
            return the;
        }

        var options = the._options;
        var onopen = function () {
            /**
             * 窗口打开之后
             * @event open
             */
            the.emit('open');

            if (typeis.function(callback)) {
                callback.call(the);
            }
        };

        var to = the._getPos();
        the.visible = true;
        to.display = 'block';
        to.zIndex = ui.getZindex();

        attribute.css(the._$window, to);

        animation.keyframes(the._$window, {
            name: the._keyframes,
            duration: options.duration,
            easing: options.easing
        }, onopen);

        return the;
    };


    /**
     * 改变 window 尺寸
     * @param [size] {Object} 尺寸
     * @param [callback] {Function} 回调
     */
    Window.fn.resize = function (size, callback) {
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

        var to = the._getPos();

        animation.animate(the._$window, to, {
            duration: options.duration,
            easing: options.easing
        }, function () {
            callback.call(the);
        });

        return the;
    };


    /**
     * 关闭窗口
     * @param [callback] {Function} 打开之后回调
     */
    Window.fn.close = function (callback) {
        var the = this;

        callback = typeis.function(callback) ? callback : noop;

        if (!the.visible) {
            animation.stop(the._$window);
            callback.call(the);
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
                transform: '',
                display: 'none'
            });

            callback.call(the);
        };

        the.visible = false;

        animation.keyframes(the._$window, {
            name: the._keyframes,
            direction: 'reverse',
            duration: options.duration,
            easing: options.easing
        }, onclose);

        return the;
    };


    /**
     * 获取当前 window 节点
     */
    Window.fn.getNode = function () {
        return this._$window;
    };


    /**
     * 震晃窗口以示提醒
     */
    Window.fn.shake = function () {
        var the = this;
        var className = alienClass + '-shake';

        if (the._shakeTimeid) {
            clearTimeout(the._shakeTimeid);
            attribute.removeClass(the._$window, className);
        }

        attribute.addClass(the._$window, className);
        the._shakeTimeid = setTimeout(function () {
            the._shakeTimeid = 0;
            attribute.removeClass(the._$window, className);
        }, 500);

        return the;
    };


    /**
     * 销毁实例
     */
    Window.fn.destroy = function (callback) {
        var the = this;
        var destroy = function () {
            if (the._$content) {
                modification.insert(the._$content, the._$contentPos, 'afterend');
                modification.remove(the._$contentPos);
            }

            modification.remove(the._$window);
            event.un(the._$window, 'click');

            if (typeis.function(callback)) {
                callback();
            }
        };

        if (the.visible) {
            the.close(destroy);
            the.visible = false;
        } else {
            destroy();
        }
    };

    /**
     * 创建一个窗口实例
     * @param $content {Object} 内容节点，为 null 时创建一个新的 window
     * @param [options] {Object} 配置
     * @param [options.width="auto"] {Number|String} 窗口宽度，当 width="height" 并且 height="width"时，取 width 和 height 的最大值，并保持相等
     * @param [options.height="auto"] {Number|String} 窗口高度，当 width="height" 并且 height="width"时，取 width 和 height 的最大值，并保持相等
     * @param [options.left="center"] {Number|String} 窗口左位移
     * @param [options.top="center"] {Number|String} 窗口上位移
     * @param [options.duration=456] {Number} 窗口打开动画时间
     * @param [options.easing="ease-in-out-back"] {Number} 窗口打开动画缓冲
     * @param [options.addClass=""] {String} 窗口添加的 className
     * @param [options.zIndex=null] {null|Number} 窗口层级，默认自动分配
     */
    module.exports = Window;
    modification.importStyle(style);
});