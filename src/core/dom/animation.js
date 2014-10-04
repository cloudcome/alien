/*!
 * animation.js
 * @author ydr.me
 * @ref https://github.com/visionmedia/move.js
 * 2014-09-20 11:08
 */


define(function (require, exports, module) {
    /**
     * 单次动画，如果要实现动画队列，使用`howdo`配合起来使用即可实现
     *
     * @module core/dom/animation
     * @requires core/dom/attribute
     * @requires util/data
     * @requires core/navigator/compatible
     * @requires core/event/base
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
    var regCubic = /^cubic-bezier\(/i;
    var defaults = {
        easing: 'linear',
        duration: 789,
        delay: 0
    };
    var transitionendEventType = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd';
    var noop = function () {
        // ignore
    };
    var key = 'alien-core-animation-'+Date.now();
    var index = 0;
    var animationMap = {};
    window.attribute = attribute;

    module.exports = {
        /**
         * 动画，不会判断当前动画终点与当前是否一致
         * @param {HTMLElement|Node} ele 元素
         * @param {Object} to 终点
         * @param {Object} [options] 配置
         * @param {String} [options.easing] 缓冲类型，默认为`liner`
         * @param {Number} [options.duration] 动画时间，默认789ms
         * @param {Number} [options.delay] 延迟时间，默认0
         * @param {Function} [callback] 回调
         *
         * @example
         * animation.animate(ele, to);
         * animation.animate(ele, to, property);
         * animation.animate(ele, to, callback);
         * animation.animate(ele, to, property, callback);
         */
        animate: function (ele, to, options, callback) {
            if (attribute.css(ele, 'display') === 'none') {
                return;
            }

            if(!ele[key]){
                ele[key] = ++index;
            }

            var id = ele[key];
            var args = arguments;
            var argL = args.length;
            var keys = [];
            var listener;
            var hasDispatch = 0;
            var easing = '';
            var timeid = 0;

            // 如果正在动画，取消后续操作
            if(animationMap[id]){
                return;
            }

            animationMap[id] = to;
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
                animationMap[id] = null;
                event.un(ele, transitionendEventType, listener);
                attribute.css(ele, 'transition-duration', '');
                attribute.css(ele, 'transition-delay', '');
                attribute.css(ele, 'transition-timing-function', '');
                attribute.css(ele, 'transition-property', '');
                callback();
            };

            event.on(ele, transitionendEventType, listener);
            options = data.extend({}, defaults, options);
            easing = easingMap[options.easing];
            easing = !easing && !regCubic.test(options.easing) ?
                easingMap[defaults.easing] :
                defaults.easing;

            data.each(to, function (key) {
                keys.push(key);
            });

            attribute.css(ele, 'transition-duration', options.duration + 'ms');
            attribute.css(ele, 'transition-delay', options.delay + 'ms');
            attribute.css(ele, 'transition-timing-function', easing);
            attribute.css(ele, 'transition-property', keys.join(','));

            setTimeout(function () {
                data.each(to, function (key, val) {
                    attribute.css(ele, key, val);
                });
            }, 0);

            timeid = setTimeout(listener, options.duration + options.delay + 50);
        },
        /**
         * 停止当前动画
         * @param ele {HTMLElement|Node} 元素
         * @param [toEnd=false] {Boolean} 是否立即停止到动画终点，默认 false
         * @returns {boolean}
         *
         * @example
         * animation.top(ele, true);
         * animation.top(ele, false);
         */
        stop: function (ele, toEnd) {
            var id = ele[key];
            var to;

            if(!id || !(to = animationMap[id])){
                return !1;
            }



            attribute.css(ele, 'transition-duration', '');
            attribute.css(ele, 'transition-delay', '');
            attribute.css(ele, 'transition-timing-function', '');
            attribute.css(ele, 'transition-property', '');
            data.each(transitionendEventType.split(' '), function (i, et) {
                event.dispatch(ele, et);
            });

            if(!toEnd){
                setTimeout(function () {
                    data.each(to, function (key) {
                        attribute.css(ele, key, attribute.css(ele, key));
                    });
                }, 0);
            }
        },
        /**
         * @todo 增加平滑滚动
         */
        scrollTo: function () {

        }
    };
});