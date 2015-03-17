/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-11 13:06
 */


define(function (require, exports, module) {
    /**
     * @module ui/Mask/
     * @requires utils/dato
     * @requires utils/typeis
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires ui/
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/touch.js');
    var animation = require('../../core/dom/animation.js');
    var ui = require('../');
    var style = require('css!./style.css');
    var alienIndex = 0;
    var alienClass = 'alien-ui-mask';
    var maskWindowLength = 0;
    var maskWindowList = [];
    var defaults = {
        addClass: '',
        zIndex: null,
        duration: 234,
        easing: 'ease-in-out-circ'
    };
    var Mask = ui.create(function ($cover, options) {
        var the = this;

        the._$cover = selector.query($cover)[0];
        the._options = dato.extend(true, {}, defaults, options);
        the.visible = false;
        the._init();
    });

    /**
     * 覆盖 window 的 mask 列表
     * @type {Array}
     */
    Mask.maskWindowList = maskWindowList;


    /**
     * 获得当前最顶层覆盖 window 的 mask
     * @returns {*}
     */
    Mask.getTopMask = function () {
        return maskWindowList[maskWindowLength - 1];
    };


    /**
     * 初始化
     * @private
     */
    Mask.fn._init = function () {
        var the = this;

        the._initNode();
        the._initEvent();

        return the;
    };


    Mask.fn._initNode = function () {
        var the = this;
        var options = the._options;
        var style = {
            display: 'none'
        };

        the.id = alienIndex;
        the._$mask = modification.create('div', {
            id: alienClass + '-' + alienIndex++,
            style: style,
            'class': alienClass
        });
        attribute.addClass(the._$mask, options.addClass);
        modification.insert(the._$mask, document.body);
    };


    Mask.fn._initEvent = function () {
        var the = this;

        event.on(the._$mask, 'click tap', function (eve) {
            var $window = selector.closest(eve.target, '.alien-ui-window')[0];

            if (!$window) {
                /**
                 * 触碰了遮罩
                 * @event hit
                 */
                the.emit('hit');
            }
        });
    };


    /**
     * 获得需要覆盖的尺寸
     * @returns {*}
     * @private
     */
    Mask.fn._getSize = function () {
        var the = this;
        var $cover = the._$cover;

        // 其他节点
        if ($cover === window) {
            return {
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };
        }

        return {
            position: 'absolute',
            width: attribute.width($cover),
            height: attribute.height($cover),
            top: attribute.top($cover),
            left: attribute.left($cover)
        };
    };


    /**
     * 打开 mask
     */
    Mask.fn.open = function () {
        var the = this;

        if (the.visible) {
            return the;
        }

        var pos = the._getSize();

        pos.display = 'block';
        pos.zIndex = the._options.zIndex || ui.getZindex();
        attribute.css(the._$mask, pos);
        the.visible = true;

        /**
         * 遮罩打开
         * @event open
         */
        the.emit('open');

        if (the._$cover === window) {
            maskWindowLength++;
            maskWindowList.push(the);
        }

        attribute.addClass(document.body, alienClass + '-overflow');

        return the;
    };


    /**
     * 重置尺寸
     * @param pos
     */
    Mask.fn.resize = function (pos) {
        var the = this;

        if (!the.visible) {
            return the;
        }

        var options = the._options;

        pos = dato.extend({}, the._getSize(), pos);
        animation.animate(the._$mask, pos, {
            duation: options.duration,
            easing: options.easing
        }, function () {
            /**
             * 遮罩改变尺寸后
             * @event resize
             */
            the.emit('resize');
        });

        return the;
    };


    /**
     * 关闭 mask
     */
    Mask.fn.close = function () {
        var the = this;

        if (!the.visible) {
            return the;
        }

        attribute.css(the._$mask, 'display', 'none');
        the.visible = false;

        /**
         * 遮罩关闭后
         * @event close
         */
        the.emit('close');

        if (the._$cover === window) {
            maskWindowLength--;

            var findIndex = -1;

            dato.each(maskWindowList, function (index, mask) {
                if (mask.id === the.id) {
                    findIndex = index;
                    return false;
                }
            });

            maskWindowList.splice(findIndex, 1);
        }

        if (!maskWindowLength) {
            attribute.removeClass(document.body, alienClass + '-overflow');
        }

        return the;
    };


    /**
     * 获取当前 mask 节点
     * @returns {HTMLElementNode}
     */
    Mask.fn.getNode = function () {
        return this._$mask;
    };


    /**
     * 销毁实例
     */
    Mask.fn.destroy = function (callback) {
        var the = this;

        the.close();
        event.un(the._$mask, 'click tap');
        modification.remove(the._$mask);

        if (typeis.function(callback)) {
            callback();
        }
    };

    /**
     * 构造一个 mask
     * @param $cover {Object} 欲覆盖的节点
     * @param [options] {Object} 配置
     * @param [options.zIndex=null] {Number} 层级，默认为null，即自动分配
     * @param [options.addClass=""] {String} 添加的 className，默认为空
     * @param [options.duration=234] {Number} resize 时的动画时间
     * @param [options.easing="ease-in-out-circ"] {Number} resize 时的动画缓冲
     */
    module.exports = Mask;
    style += '.' + alienClass + '-overflow{margin-right:' + _getScrollbarWidth() + 'px !important;}';
    modification.importStyle(style);
    event.on(document, 'keyup', function (eve) {
        var mask;

        if (eve.which === 27 && Mask.maskWindowList.length) {
            mask = Mask.getTopMask();

            /**
             * 当前遮罩被按 ESC 后
             * @event esc
             */
            mask.emit('esc');
        }
    });


    /**
     * 获得当前页面的滚动条宽度
     * @returns {number}
     * @private
     */
    function _getScrollbarWidth() {
        var $div = modification.create('div', {
            style: {
                position: 'absolute',
                width: 100,
                height: 100,
                overflow: 'scroll'
            }
        });

        modification.insert($div, document.body);

        var width = $div.offsetWidth - $div.clientWidth;
        modification.remove($div);

        return width;
    }
});