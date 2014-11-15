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
     * @requires util/dato
     * @requires util/typeis
     * @requires core/navigator/compatible
     * @requires core/event/base
     */
    'use strict';

    var udf;
    var attribute = require('./attribute.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var eeeing = require('../../util/easing.js');
    var compatible = require('../navigator/compatible.js');
    var event = require('../event/base.js');
    var cssDefaults = {
        easing: 'in-out',
        duration: 789,
        delay: 0
    };
    var jsDefaults = {
        easing: 'swing',
        duration: 789,
        delay: 0
    };
    var transitionendEventType = compatible.html5('transitionend', window, !0);
    var noop = function () {
        // ignore
    };
    var key = 'alien-core-dom-animation-';
    var index = 0;
    var animationMap = {};
    var requestAnimationFrame = compatible.html5('requestAnimationFrame', window);

    module.exports = {
        /**
         * 动画，不会判断当前动画终点与当前是否一致
         *
         * @param {HTMLElement|Node} ele 元素
         * @param {Object} to 终点
         * @param {Object} [options] 配置
         * @param {String} [options.easing] 缓冲类型，默认为`in-out`，内置的有
         * in、out、in-out、snap、linear、ease-in-quad、ease-in-cubic、ease-in-quart、
         * ease-in-sine、ease-in-expo、ease-in-circ、ease-in-back、ease-out-quad、
         * ease-out-cubic、ease-out-quart、ease-out-sine、ease-out-expo、ease-out-circ、
         * ease-out-back、ease-in-out-quad、ease-in-out-cubic、ease-in-out-quart、ease-in-out-sine、
         * ease-in-out-expo、ease-in-out-circ、ease-in-out-back，也可以提供自定义的缓冲类型，格式为 css3的
         * `ransition-timing-function`的值，为`cubic-bezier(...)`
         * @param {Number} [options.duration] 动画时间，默认789，单位ms
         * @param {Number} [options.delay] 延迟时间，默认0，单位ms
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

            if (!ele[key]) {
                ele[key] = ++index;
            }

            var id = ele[key];
            var args = arguments;
            var argL = args.length;
            var keys = [];
            var listener;
            var hasDispatch = 0;
            var timeid = 0;
            var easing = '';
            // 修正 CSS 终点
            var fixTo = {};
            var durationVal = [];
            var delayVal = [];
            var easingVal = [];
            var i = 0;

            // 如果正在动画，取消后续操作
            if (animationMap[id]) {
                return;
            }

            animationMap[id] = to;
            callback = args[argL - 1];

            if (argL === 3) {
                // .animate(element, to, callback);
                if (typeis(args[2]) === 'function') {
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
            options = dato.extend({}, cssDefaults, options);
            easing = eeeing.css3[options.easing];

            if (!easing) {
                easing = options.easing;
            }

            dato.each(to, function (key, val) {
                var obj = attribute.fixCss(key, val);
                var temp = {};
                temp[obj.key] = obj.val;

                dato.extend(fixTo, temp);
                keys.push(obj.key);
            });

            // 如果动画中包含 left、top 要格外注意，当初始值为 auto 时会发生动画瞬间完成，
            // 因此，此时需要计算出 left、top 值
            if (keys.indexOf('left') > -1) {
                // 先定位好
                attribute.left(ele, attribute.left(ele));
                attribute.css(ele, 'left', dato.parseFloat(attribute.css(ele, 'left'), 0));
            }

            if (keys.indexOf('top') > -1) {
                // 先定位好
                attribute.top(ele, attribute.top(ele));
                attribute.css(ele, 'top', dato.parseFloat(attribute.css(ele, 'top'), 0));
            }

            for (; i < keys.length; i++) {
                durationVal.push(options.duration + 'ms');
                delayVal.push(options.delay + 'ms');
                easingVal.push(easing);
            }

            attribute.css(ele, 'transition-duration', durationVal.join(','));
            attribute.css(ele, 'transition-delay', delayVal.join(','));
            attribute.css(ele, 'transition-timing-function', easingVal.join(','));
            attribute.css(ele, 'transition-property', keys.join(','));

            setTimeout(function () {
                dato.each(fixTo, function (key, val) {
                    attribute.css(ele, key, val);
                });
            }, 0);

            timeid = setTimeout(listener, options.duration + options.delay + 50);
        },


        /**
         * 停止当前动画
         * @param ele {HTMLElement|Node} 元素
         * @param [toEnd=false] {Boolean} 是否立即停止到动画终点，默认 false
         * @returns {undefined}
         *
         * @example
         * animation.top(ele, true);
         * animation.top(ele, false);
         */
        stop: function (ele, toEnd) {
            var id = ele[key];
            var to;

            if (!id || !(to = animationMap[id])) {
                return;
            }

            if (!toEnd) {
                dato.each(to, function (key) {
                    attribute.css(ele, key, attribute.css(ele, key));
                });
            }

            attribute.css(ele, 'transition-duration', '');
            attribute.css(ele, 'transition-delay', '');
            attribute.css(ele, 'transition-timing-function', '');
            attribute.css(ele, 'transition-property', '');
            dato.each(transitionendEventType.split(' '), function (i, et) {
                event.dispatch(ele, et);
            });
        },


        /**
         * 平滑滚动
         * @param {HTMLElement|Node|window|document} ele 要滚动的元素
         * @param {Object} to 终点
         * @param {Object} [to.x] x轴终点
         * @param {Object} [to.y] y轴终点
         * @param {Object} [options] 配置
         * @param {Object} [options.duration] 动画时间，默认789，单位 ms
         * @param {Object} [options.easing] 动画缓冲，默认 swing
         * 默认配置的缓冲函数有：linear、easeIn、easeOut、easeBoth、easeInStrong、easeOutStrong
         * easeBothStrong、easeOutQuart、easeInOutExpo、easeOutExpo、swing、swingFrom、swingTo
         * backIn、backOut、bounce、doubleSqrt，也可以自定义缓冲函数，只有一个参数t，表示时间比 = 已耗时 / 总时间，
         * 计算值=开始值 + ( 结束值 - 开始值 ) * 时间比
         * @param {Object} [options.delay] 动画延时，默认0，单位ms
         * @param {Function} [callback] 回调
         * @returns {undefined}
         *
         * @example
         * animation.scrollTo(window, {
         *    x: 100,
         *    y: 100
         * }, {
         *    duration: 1000,
         *    easing: 'linear',
         *    delay: 100
         * }, function(){
         *    alert('OK');
         * });
         */
        scrollTo: function (ele, to, options, callback) {
            var args = arguments;
            var from = {
                x: attribute.scrollLeft(ele),
                y: attribute.scrollTop(ele)
            };
            var totalDistance;
            var pastTime = 0;
            var beginTimestamp;

            if (typeis(args[2]) === 'function') {
                callback = args[2];
            }

            to = to || {};
            to.x = to.x === udf ? from.x : to.x;
            to.y = to.y === udf ? from.y : to.y;
            options = dato.extend(!0, {}, jsDefaults, options);

            totalDistance = {
                x: to.x - from.x,
                y: to.y - from.y
            };

            if (!totalDistance.x && !totalDistance.y) {
                return callback.call(ele);
            }

            setTimeout(_progress, options.delay);

            function _progress() {
                if (!beginTimestamp) {
                    beginTimestamp = Date.now();
                }

                // 时间超过 || 距离超过
                if (pastTime >= options.duration) {
                    if (totalDistance.x) {
                        attribute.scrollLeft(ele, to.x);
                    }

                    if (totalDistance.y) {
                        attribute.scrollTop(ele, to.y);
                    }

                    callback.call(ele);
                } else {
                    window[requestAnimationFrame](function () {
                        if (!eeeing.js[options.easing]) {
                            throw new Error('can not find easing name of ' + options.easing);
                        }

                        pastTime = Date.now() - beginTimestamp;

                        var easing = eeeing.js[options.easing];
                        // 时间比 = 已耗时 / 总时间
                        var t = pastTime / options.duration;
                        // 当前值 = 开始值 + ( 结束值 - 开始值 ) * 时间比
                        var x = from.x + (to.x - from.x) * easing(t);
                        var y = from.y + (to.y - from.y) * easing(t);

                        if (totalDistance.x) {
                            attribute.scrollLeft(ele, x);
                        }

                        if (totalDistance.y) {
                            attribute.scrollTop(ele, y);
                        }

                        _progress();
                    });
                }
            }
        }
    };
});

