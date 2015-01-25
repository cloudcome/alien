/*!
 * 提示UI
 * @author ydr.me
 * @create 2014-10-16 21:41
 */


define(function (require, exports, module) {
    /**
     * @module ui/Tooltip/
     * @requires ui/base
     * @requires util/dato
     * @requires libs/Template
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires core/event/base
     */
    'use strict';

    var ui = require('../base.js');
    var template = require('html!./template.html');
    var style = require('css!./style.css');
    var dato = require('../../util/dato.js');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/base.js');
    var alienIndex = 0;
    var tooltipClass = 'alien-ui-tooltip';
    // http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    //var animationendEventType = 'animationend webkitAnimationEnd oanimationend MSAnimationEnd';
    var defaults = {
        duration: 234,
        easing: 'ease-out-quart',
        zIndex: 9999,
        placement: 'auto',
        body: 'Hello world!'
    };
    var Tooltip = ui.create({
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
            the._options = dato.extend(!0, {}, defaults, options);
            the._id = alienIndex++;
            the._init();
        },


        _init: function () {
            var the = this;
            var tooltip = tpl.render({
                id: the._id
            });
            var $tooltip = modification.parse(tooltip)[0];
            var $body = selector.query('.' + tooltipClass + '-body', $tooltip)[0];

            $body.innerHTML = the._options.body;
            modification.insert($tooltip, document.body, 'beforeend');
            the._$tooltip = $tooltip;
            the._position(1);
            the._position(2);
        },

        _position: function (times) {
            var the = this;
            var $ele = the._$ele;
            var $tip = the._$tooltip;
            var options = the._options;
            var scrL = attribute.scrollLeft(window);
            var scrT = attribute.scrollTop(window);
            var eleW = attribute.outerWidth($ele);
            var eleH = attribute.outerHeight($ele);
            var eleL = attribute.left($ele) - scrL;
            var eleT = attribute.top($ele) - scrT;
            var tipW = attribute.outerWidth($tip);
            var tipH = attribute.outerHeight($tip);
            var winW = attribute.width(window);
            var winH = attribute.height(window);
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

            if (times === 2) {
                attribute.css($tip, 'visibility', 'visible');
                attribute.addClass($tip, tooltipClass + '-' + at);
                the._animate(true, function () {
                    the.emit('open');
                });
            }

            attribute.css($tip, {
                left: left + scrL,
                top: top + scrT
            });
        },


        /**
         * 动画
         * @param isShow
         * @param callback
         * @private
         */
        _animate: function (isShow, callback) {
            var the = this;
            var options = the._options;
            var at = the._at;
            var from = {
                transform: 'translate' + (at === 'top' || at === 'bottom' ? 'Y' : 'X') +
                '(' +
                (isShow ? (at === 'right' || at === 'bottom' ? '-' : '') + '50%' : '0') +
                ')',
                opacity: isShow ? 0 : 1
            };
            var to = {
                transform: 'translate' + (at === 'top' || at === 'bottom' ? 'Y' : 'X') +
                '(' +
                (isShow ? '0' : (at === 'right' || at === 'bottom' ? '-' : '') + '50%') +
                ')',
                opacity: isShow ? 1 : 0
            };
            var $tip = the._$tooltip;

            attribute.css($tip, from);
            animation.animate($tip, to, {
                duration: options.duration,
                easing: options.easing
            }, callback);
        },


        /**
         * 销毁实例
         * @public
         */
        destroy: function () {
            var the = this;

            the._animate(false, function () {
                the.emit('close');
                modification.remove(the._$tooltip);
            });
        }
    });


    /**
     * 实例化一个 Tooltip
     * @param ele {Node|Element|String} 参考元素或选择器
     * @param [options] {Object} 配置
     * @param [options.zIndex=9999] {Number} 层级
     * @param [options.placement="auto"] {String} 所在位置，可选：top、bottom、right、left
     * @param [options.body="Hello world!"] {String} 提示内容
     * @constructor
     *
     * @example
     * var tp = new Tooltip(ele, options);
     */
    module.exports = Tooltip;
    modification.importStyle(style);
});