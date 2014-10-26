/*!
 * Tooltip.js
 * @author ydr.me
 * @create 2014-10-16 21:41
 */


define(function (require, exports, module) {
    /**
     * @module ui/Tooltip
     * @requires util/class
     * @requires util/data
     * @requires libs/Emitter
     * @requires core/dom/selector
     */
    'use strict';

    var style =require('text!./style.css');
    var klass = require('../../util/class.js');
    var data = require('../../util/data.js');
    var Emitter = require('../../libs/Emitter.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/base.js');
    var index = 1;
    var tooltipClass = 'alien-ui-tooltip';
    // http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    var animationendEventType = 'animationend webkitAnimationEnd oanimationend MSAnimationEnd';
    var defaults = {
        zIndex: 9999,
        placement: 'auto',
        content: 'Hello world!'
    };
    var Tooltip = klass.create({
        STATIC: {
            /**
             * 默认配置
             * @name defaults
             * @property [zIndex=9999] {Number} 层级
             * @property [placement="auto"] {String} 所在位置，可选：top、bottom、right、left
             * @property [content="Hello world!"] {String} 提示内容
             */
            defaults: defaults
        },

        constructor: function (ele, options) {
            var the = this;

            ele = selector.query(ele);

            if (!ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = ele[0];
            Emitter.apply(the, arguments);
            the._options = data.extend(!0, {}, defaults, options);
            the._id = index++;
            the._init();
        },


        _init: function () {
            var the = this;
            var $tooltip = modification.parse('<div class="' + tooltipClass + '" id="' + tooltipClass + '-' + index + '">' +
            '<div class="' + tooltipClass + '-arrow"></div>' +
            '<div class="' + tooltipClass + '-content">' + the._options.content + '</div>' +
            '</div>')[0];
            modification.insert($tooltip, document.body, 'beforeend');

            the._$tooltip = $tooltip;
            the._position(1);
            the._position(2);
            index++;
        },

        _position: function (times) {
            var the = this;
            var $ele = the._$ele;
            var $tip = the._$tooltip;
            var options = the._options;
            var eleW = attribute.outerWidth($ele);
            var eleH = attribute.outerHeight($ele);
            var eleL = attribute.left($ele);
            var eleT = attribute.top($ele);
            var tipW = attribute.outerWidth($tip);
            var tipH = attribute.outerHeight($tip);
            var winW = attribute.width(window);
            var winH = attribute.height(window);
            var scrL = attribute.scrollLeft(window);
            var scrT = attribute.scrollTop(window);
            var vieW = scrL + winW;
            var vieH = scrT + winH;
            var at = 'top';
            var left;
            var top;

            switch (options.placement) {
                case 'auto':
                    // 上下右左
                    if (eleL + eleW / 2 - tipW / 2 > scrL && eleT - tipH > scrT && eleL + eleW / 2 + tipW / 2 < vieW) {
                        at = 'top';
                    } else if (eleL + eleW / 2 + tipW / 2 < vieW && eleT + eleH + tipH < vieH && eleL + eleW / 2 - tipW / 2 > scrL) {
                        at = 'bottom';
                    } else if (eleT + eleH / 2 - tipH / 2 > scrT && eleL + eleW + tipW < vieW && eleT + eleH / 2 + tipH / 2 < vieH) {
                        at = 'right';
                    } else if (eleT + eleH / 2 + tipH / 2 < vieH && eleL - tipW > scrL && eleT + eleH / 2 - tipH / 2 > scrT) {
                        at = 'left';
                    } else {
                        at = 'top';
                    }
                    break;
                default:
                    at = options.placement;
            }

            switch (at) {
                case 'top':
                    left = eleL + eleW / 2 - tipW / 2;
                    top = eleT - tipH;
                    break;
                case 'right':
                    left = eleL + eleW;
                    top = eleT + eleH / 2 - tipH / 2;
                    break;
                case 'bottom':
                    left = eleL + eleW / 2 - tipW / 2;
                    top = eleT + eleH;
                    break;
                case 'left':
                    left = eleL - tipW;
                    top = eleT + eleH / 2 - tipH / 2;
                    break;
            }

            the._at = at;

            if(times === 2){
                attribute.css($tip, 'visibility', 'visible');
                event.on($tip, animationendEventType, function () {
                    event.un($tip, animationendEventType);
                    attribute.removeClass($tip, 'alien-ui-tooltip-animation-' + the._at);
                });
                attribute.addClass($tip, tooltipClass + '-' + at + ' ' + tooltipClass + '-animation-' + at);
            }

            attribute.css($tip, {
                left: left + scrL,
                top: top + scrT
            });
        },


        /**
         * 销毁实例
         * @public
         */
        destroy: function () {
            var the = this;
            var $tip = the._$tooltip;

            event.on($tip, animationendEventType, function () {
                event.un($tip, animationendEventType);
                modification.remove($tip);
            });

            attribute.css($tip, 'animation-direction', 'reverse');
            attribute.addClass($tip, 'alien-ui-tooltip-animation-' + the._at);
        }
    });

    modification.importStyle(style);

    /**
     * 实例化一个 Tooltip
     * @param ele {Node|Element|String} 参考元素或选择器
     * @param [options] {Object} 配置
     * @param [options.zIndex=9999] {Number} 层级
     * @param [options.placement="auto"] {String} 所在位置，可选：top、bottom、right、left
     * @param [options.content="Hello world!"] {String} 提示内容
     * @constructor
     *
     * @example
     * var tp = new Tooltip(ele, options);
     */
    module.exports = Tooltip;
});