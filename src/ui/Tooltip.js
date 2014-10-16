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

    var klass = require('../util/class.js');
    var data = require('../util/data.js');
    var Emitter = require('../libs/Emitter.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var event = require('../core/event/base.js');
    var index = 1;
    var tooltipClass = 'alien-ui-tooltip';
    // http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    var animationendEventType = 'animationend webkitAnimationEnd oanimationend MSAnimationEnd';
    var defaults = {
        zIndex: 9999,
        placement: 'auto',
        content: 'Hello world!',
        duration: 345,
        easing: 'in-out'
    };
    var Tooltip = klass.create({
        STATIC: {
            defaults: defaults
        },

        constructor: function (ele, options) {
            var the = this;


            the._ele = selector.query(ele);

            if (!the._ele.length) {
                throw new Error('instance element is empty');
            }

            the._ele = the._ele[0];
            Emitter.apply(the, arguments);
            the._options = data.extend(!0, {}, defaults, options);
            the._id = index++;
            the._init();
        },


        _init: function () {
            var the = this;
            var tooltip = modification.parse('<div class="' + tooltipClass + '" id="' + tooltipClass + '-' + index + '">' +
                '<div class="' + tooltipClass + '-arrow"></div>' +
                '<div class="' + tooltipClass + '-content">' + the._options.content + '</div>' +
                '</div>')[0];
            modification.insert(tooltip, document.body, 'beforeend');

            the._tooltip = tooltip;
            the._position();
            index++;
        },

        _position: function () {
            var the = this;
            var ele = the._ele;
            var tip = the._tooltip;
            var options = the._options;
            var eleW = attribute.width(ele);
            var eleH = attribute.height(ele);
            var eleL = attribute.left(ele);
            var eleT = attribute.top(ele);
            var tipW = attribute.width(tip);
            var tipH = attribute.height(tip);
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
                    if (eleL + eleW / 2 - tipW / 2 > scrL && eleT + eleH - tipH > scrT && eleL + eleW / 2 + tipW / 2 < vieW) {
                        at = 'top';
                    } else if (eleL + eleW / 2 + tipW / 2 < vieW && eleT + eleH + tipH < vieH && eleL + eleW / 2 - tipW / 2 > scrL) {
                        at = 'bottom';
                    } else if (eleT + eleH / 2 - tipH / 2 > scrT && eleL + eleW + tipW < vieW && eleT + eleH / 2 + tipH / 2 < vieH) {
                        at = 'right';
                    } else if (eleT + eleH / 2 + tipH / 2 > vieH && eleL - tipW > scrL && eleT + eleH / 2 - tipH / 2 > scrT) {
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
            event.on(tip, animationendEventType, function () {
                event.un(tip, animationendEventType);
                attribute.removeClass(tip, 'alien-ui-tooltip-animation-' + the._at);
            });
            attribute.addClass(tip, tooltipClass + '-' + at + ' ' + tooltipClass + '-animation-' + at);
            attribute.css(tip, {
                left: left,
                top: top
            });
        },


        destroy: function () {
            var the = this;
            var tip = the._tooltip;

            event.on(tip, animationendEventType, function () {
                event.un(tip, animationendEventType);
                modification.remove(tip);
            });

            attribute.css(tip, 'animation-direction', 'reverse');
            attribute.addClass(tip, 'alien-ui-tooltip-animation-' + the._at);
        }
    });
    var style =
        // top
        '@-webkit-keyframes alien-ui-tooltip-top{0%{-webkit-transform:translateY(90%);opacity:0;}100%{-webkit-transform:translateY(0);opacity:1;}}' +
        '@-moz-keyframes alien-ui-tooltip-top{0%{-moz-transform:translateY(90%);opacity:0;}100%{-moz-transform:translateY(0);opacity:1;}}' +
        '@keyframes alien-ui-tooltip-top{0%{transform:translateY(90%);opacity:0;}100%{transform:translateY(0);opacity:1;}}' +
        // right
        '@-webkit-keyframes alien-ui-tooltip-right{0%{-webkit-transform:translateX(-90%);opacity:0;}100%{-webkit-transform:translateX(0);opacity:1;}}' +
        '@-moz-keyframes alien-ui-tooltip-right{0%{-moz-transform:translateX(-90%);opacity:0;}100%{-moz-transform:translateX(0);opacity:1;}}' +
        '@-keyframes alien-ui-tooltip-right{0%{transform:translateX(-90%);opacity:0;}100%{transform:translateX(0);opacity:1;}}' +
        // bottom
        '@-webkit-keyframes alien-ui-tooltip-bottom{0%{-webkit-transform:translateY(-90%);opacity:0;}100%{-webkit-transform:translateY(0);opacity:1;}}' +
        '@-moz-keyframes alien-ui-tooltip-bottom{0%{-moz-transform:translateY(-90%);opacity:0;}100%{-moz-transform:translateY(0);opacity:1;}}' +
        '@keyframes alien-ui-tooltip-bottom{0%{transform:translateY(-90%);opacity:0;}100%{transform:translateY(0);opacity:1;}}' +
        // left
        '@-webkit-keyframes alien-ui-tooltip-left{0%{-webkit-transform:translateX(90%);opacity:0;}100%{-webkit-transform:translateX(0);opacity:1;}}' +
        '@-moz-keyframes alien-ui-tooltip-left{0%{-webkit-transform:translateX(90%);opacity:0;}100%{-webkit-transform:translateX(0);opacity:1;}}' +
        '@keyframes alien-ui-tooltip-left{0%{-webkit-transform:translateX(90%);opacity:0;}100%{-webkit-transform:translateX(0);opacity:1;}}' +
        // wrap
        '.alien-ui-tooltip{position:absolute;background:#000;color:#fff;padding:4px 8px;border-radius:4px;font-size:14px;font-weight:normal;line-height:20px;}' +
        '.alien-ui-tooltip-arrow{position:absolute;width:0;height:0;border-color:transparent;border-style:solid}' +
        // 上提示
        '.alien-ui-tooltip-top{margin-top:-5px;}' +
        '.alien-ui-tooltip-top .alien-ui-tooltip-arrow{bottom:-5px;left:50%;margin-left:-5px;border-width:5px 5px 0;border-top-color:#000}' +
        '.alien-ui-tooltip-animation-top{-webkit-animation-duration:345ms;-moz-animation-duration:345ms;animation-duration:345ms;-webkit-animation-name:alien-ui-tooltip-top;-webkit-animation-name:alien-ui-tooltip-top;animation-name:alien-ui-tooltip-top}' +
        // 右提示
        '.alien-ui-tooltip-animation-right{-webkit-animation-duration:345ms;-moz-animation-duration:345ms;animation-duration:345ms;-webkit-animation-name:alien-ui-tooltip-right;-webkit-animation-name:alien-ui-tooltip-right;animation-name:alien-ui-tooltip-right}' +
        // 下提示
        '.alien-ui-tooltip-animation-bottom{-webkit-animation-duration:345ms;-moz-animation-duration:345ms;animation-duration:345ms;-webkit-animation-name:alien-ui-tooltip-bottom;-webkit-animation-name:alien-ui-tooltip-bottom;animation-name:alien-ui-tooltip-bottom}' +
        // 左提示
        '.alien-ui-tooltip-animation-left{-webkit-animation-duration:345ms;-moz-animation-duration:345ms;animation-duration:345ms;-webkit-animation-name:alien-ui-tooltip-left;-webkit-animation-name:alien-ui-tooltip-left;animation-name:alien-ui-tooltip-left}' +
        '';

    modification.importStyle(style);

    module.exports = Tooltip;
});