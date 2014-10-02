/*!
 * animation.js
 * @author ydr.me
 * @ref https://github.com/visionmedia/move.js
 * 2014-09-20 11:08
 */


define(function (require, exports, module) {
    /**
     * @module core/dom/animation
     */
    'use strict';

    var attribute = require('./attribute.js');
    var data = require('../../util/data.js');
    var compatible = require('../navigator/compatible.js');
    var event = require('../event/base.js');
    var easingMap = {
        'in': 'ease-in',
        'out': 'ease-out',
        'in-out': 'ease-in-out',
        'snap': 'cubic-bezier(0,1,.5,1)',
        'linear': 'cubic-bezier(.25,.25,.75,.75)',
        'ease-in-quad': 'cubic-bezier(.55,.085,.68,.53)',
        'ease-in-cubic': 'cubic-bezier(.55,.055,.675,.19)',
        'ease-in-quart': 'cubic-bezier(.895,.03,.685,.22)',
        'ease-in-quint': 'cubic-bezier(.755,.05,.855,.06)',
        'ease-in-sine': 'cubic-bezier(.470,0,.745,.715)',
        'ease-in-expo': 'cubic-bezier(.950,.05,.795,.035)',
        'ease-in-circ': 'cubic-bezier(.6,.04,.98,.335)',
        'ease-in-back': 'cubic-bezier(.6,-.28,.735,.045)',
        'ease-out-quad': 'cubic-bezier(.25,.46,.45,.94)',
        'ease-out-cubic': 'cubic-bezier(.215,.61,.355,1)',
        'ease-out-quart': 'cubic-bezier(.165,.84,.44,1)',
        'ease-out-quint': 'cubic-bezier(.23, 1,.32,1)',
        'ease-out-sine': 'cubic-bezier(.39,.575,.565,1)',
        'ease-out-expo': 'cubic-bezier(.19,1,.22,1)',
        'ease-out-circ': 'cubic-bezier(.075,.82,.165,1)',
        'ease-out-back': 'cubic-bezier(.175,.885,.32,1.275)',
        'ease-in-out-quart': 'cubic-bezier(.770,0,.175,1)',
        'ease-in-out-quint': 'cubic-bezier(.860,0,.07,1)',
        'ease-in-out-sine': 'cubic-bezier(.445,.05,.55,.95)',
        'ease-in-out-expo': 'cubic-bezier(1,0,0,1)',
        'ease-in-out-circ': 'cubic-bezier(.785,.135,.15,.86)',
        'ease-in-out-back': 'cubic-bezier(.68,-.55,.265,1.55)'
    };
    var defaults = {
        easing: 'linear',
        duration: 789,
        delay: 0
    };
    var transitionendEventType = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd';
    var noop = function () {
    };

    module.exports = {
        /**
         * 动画
         * @param {HTMLElement|Node} element 元素
         * @param {Object} to 终点
         * @param {Object} [options] 配置
         * @param {Function} [callback] 回调
         *
         * @examples
         * .animate(element, to);
         * .animate(element, to, property);
         * .animate(element, to, callback);
         * .animate(element, to, property, callback);
         */
        animate: function (element, to, options, callback) {
            if (attribute.css(element, 'display') === 'none') {
                return;
            }

            var args = arguments;
            var argL = args.length;
            var keys = [];
            var listener;
            var hasDispatch = 0;
            var easing = '';
            var timeid = 0;

            callback = args[argL - 1];

            if (argL === 3) {
                // .animate(element, to, callback);
                if (data.type(args[2]) === 'function') {
                    options = {};
                }
                // .animate(element, to, property);
                else {
                    callback = noop;
                }
            }
            // .animate(element, to);
            else if (argL === 2) {
                options = {};
                callback = noop;
            }

            listener = function () {
                if (timeid) {
                    clearTimeout(timeid);
                    timeid = 0;
                }

                if (hasDispatch) {
                    return;
                }

                hasDispatch = 1;
                event.un(element, transitionendEventType, listener);
                attribute.css(element, 'transition-duration', '');
                attribute.css(element, 'transition-delay', '');
                attribute.css(element, 'transition-timing-function', '');
                attribute.css(element, 'transition-property', '');
                callback();
            };

            event.on(element, transitionendEventType, listener);
            options = data.extend({}, defaults, options);
            easing = easingMap[options.easing];

            if (!easing) {
                easing = easingMap[defaults.easing];
            }

            data.each(to, function (key) {
                keys.push(key);
            });

            attribute.css(element, 'transition-duration', options.duration + 'ms');
            attribute.css(element, 'transition-delay', options.delay + 'ms');
            attribute.css(element, 'transition-timing-function', easing);
            attribute.css(element, 'transition-property', keys.join(','));

            setTimeout(function () {
                data.each(to, function (key, val) {
                    attribute.css(element, key, val);
                });
            }, 0);

            timeid = setTimeout(listener, options.duration + options.delay + 50);
        }
    };
});