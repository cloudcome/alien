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
     * @requires core/dom/selector
     * @requires utils/allocation
     * @requires utils/dato
     * @requires utils/number
     * @requires utils/typeis
     * @requires utils/easing
     * @requires core/navigator/compatible
     * @requires core/event/base
     */
    'use strict';

    var attribute = require('./attribute.js');
    var selector = require('./selector.js');
    var see = require('./see.js');
    var allocation = require('../../utils/allocation.js');
    var dato = require('../../utils/dato.js');
    var number = require('../../utils/number.js');
    var typeis = require('../../utils/typeis.js');
    var eeeing = require('../../utils/easing.js');
    var controller = require('../../utils/controller.js');
    var compatible = require('../navigator/compatible.js');
    var event = require('../event/base.js');
    var Queue = require('../../libs/queue.js');
    var transitionDefaults = {
        easing: 'in-out',
        duration: 567,
        delay: 0
    };
    var keyframesDefaults = {
        name: '',
        easing: 'in-out',
        duration: 567,
        delay: 0,
        count: 1,
        direction: 'normal',
        playState: 'running',
        // none/forwards/backwards/both
        fillMode: 'forwards'
    };
    //var css = 'transition-property';
    //var transitionendEventPrefix = compatible.css3(css).replace(css, '').replace(/-/g, '');
    //var transitionendEventType = transitionendEventPrefix ? transitionendEventPrefix + 'TransitionEnd' : 'transitionend';
    var animationendEventType = 'webkitAnimationEnd oanimationend msAnimationEnd mozAnimationEnd animationend';
    //var animationiterationEventType = 'webkitAnimationIteration oAnimationIteration msAnimationIteration mozAnimationIteration animationiteration';
    var transitionendEventType = 'webkitTransitionEnd oTransitionEnd msTransitionEnd mozTransitionEnd transitionend';
    var noop = function () {
        // ignore
    };
    var alienKey = '-alien-core-dom-animation-';
    var propTransitionKey = 'transition-queue';
    var propKeyframesKey = 'keyframes-queue';
    var propScrollToKey = 'scrollto-queue';


    /**
     * 获取 prop
     * @param $ele
     * @param propKey
     * @returns {*}
     */
    var getProp = function ($ele, propKey) {
        return attribute.prop($ele, alienKey + propKey);
    };


    /**
     * 设置 prop
     * @param $ele
     * @param propKey
     * @param propVal
     * @returns {*}
     */
    var setProp = function ($ele, propKey, propVal) {
        return attribute.prop($ele, alienKey + propKey, propVal);
    };


    // 过渡动画
    var transition = function ($ele, to, options) {
        return function (next) {
            var easing = eeeing.get(options.easing).toCSS();
            var fixTo = {};
            var keys = [];

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
                attribute.left($ele, attribute.left($ele));
                attribute.css($ele, 'left', number.parseFloat(attribute.css($ele, 'left'), 0));
            }

            if (keys.indexOf('top') > -1) {
                // 先定位好
                attribute.top($ele, attribute.top($ele));
                attribute.css($ele, 'top', number.parseFloat(attribute.css($ele, 'top'), 0));
            }

            var durationVal = [];
            var delayVal = [];
            var easingVal = [];

            dato.each(keys, function () {
                durationVal.push(options.duration + 'ms');
                delayVal.push(options.delay + 'ms');
                easingVal.push(easing);
            });

            var onend = function () {
                clearTimeout(timeid);
                exports.clearTransition($ele);
                event.un($ele, transitionendEventType, onend);
                controller.nextFrame(next);
            };

            event.on($ele, transitionendEventType, onend);

            var timeid = setTimeout(onend, options.duration + options.delay + 100);

            if (see.visible($ele)) {
                controller.nextFrame(function () {
                    attribute.css($ele, {
                        transitionDuration: durationVal.join(','),
                        transitionDelay: delayVal.join(','),
                        transitionTimingFunction: easingVal.join(','),
                        transitionProperty: keys.join(',')
                    });
                });
            } else {
                controller.nextFrame(function () {
                    attribute.css($ele, fixTo);
                    next();
                });
            }

            exports.clearTransition($ele);
            controller.nextFrame(function () {
                attribute.css($ele, to);
            });
        };
    };


    /**
     * css3 transition 动画
     * @param $ele {HTMLElement|String} 元素
     * @param to {Object} 动画终点样式
     * @param [options] {Object} 配置
     * @param [options.duration=567] {Number} 动画时间
     * @param [options.delay=0] {Number} 开始动画延迟时间
     * @param [options.easing="in-out"] {String} 动画缓冲类型
     * @param [callback] {Function} 回调
     */
    exports.transition = function ($ele, to, options, callback) {
        var args = allocation.args(arguments);
        var argL = args.length;

        $ele = selector.query($ele)[0];

        if (argL === 3) {
            // .animate(element, to, callback);
            if (typeis.function(args[2])) {
                callback = args[2];
                options = {};
            }
            // .animate(element, to, options);
            else {
                callback = noop;
            }
        }
        // .animate(element, to);
        else if (argL === 2) {
            options = {};
            callback = noop;
        }

        options = dato.extend({}, transitionDefaults, options);

        var queue = getProp($ele, propTransitionKey);

        if (!queue) {
            setProp($ele, propTransitionKey, queue = new Queue());
        }

        /**
         * 之前的任务出栈，永远保证只有一个任务在运行
         */
        queue.shift();
        queue.push(transition($ele, to, options), callback);
        queue.start();
    };


    // 帧动画
    var keyframes = function ($ele, name, options) {
        return function (next) {
            if (options.count === -1) {
                options.count = 'infinite';
            }

            var easing = eeeing.get(options.easing).toCSS();
            var css = {
                animationName: name,
                animationDuration: options.duration + 'ms',
                animationTimingFunction: easing,
                animationDelay: options.delay + 'ms',
                animationIterationCount: options.count,
                animationDirection: options.direction,
                animationPlayState: options.playState,
                animationFillMode: options.fillMode
            };

            var onend = function () {
                event.un($ele, animationendEventType, onend);
                exports.clearAnimation($ele);
                controller.nextFrame(next);
            };

            event.on($ele, animationendEventType, onend);
            exports.clearAnimation($ele);
            controller.nextFrame(function () {
                attribute.css($ele, css);
            });
        };
    };


    // @link http://www.w3school.com.cn/css3/css3_animation.asp
    // animation-name	规定需要绑定到选择器的 keyframe 名称。。
    // animation-duration	规定完成动画所花费的时间，以秒或毫秒计。
    // animation-timing-function	规定动画的速度曲线。
    // animation-delay	规定在动画开始之前的延迟。
    // animation-iteration-count	规定动画应该播放的次数。
    // animation-direction	规定是否应该轮流反向播放动画。
    // animation-play-state 规定动画是否正在运行或暂停。默认是 "running"。
    // animation-fill-mode	规定对象动画时间之外的状态。
    /**
     * 运行一段帧动画，并监听帧动画回调
     * @param $ele {HTMLElement|String} 元素
     * @param name {String|Object} 帧动画名称
     * @param [options] {Object} 配置
     * @param [options.duration=567] {Number} 动画时间
     * @param [options.delay=0] {Number} 开始动画延迟时间
     * @param [options.easing="in-out"] {String} 动画缓冲类型
     * @param [options.count=1] {Number} 动画次数
     * @param [options.direction="normal"] {String} 动画方向，可选 normal、alternate、reverse、alternate-reverse
     * @param [options.playState="running"] {String} 动画状态，默认运动
     * @param [options.fillMode="forwards"] {String} 动画结束，默认指向最后一帧
     * @param [callback] {Function} 全部次数帧动画运行完毕回调
     */
    exports.keyframes = function ($ele, name, options, callback) {
        var args = allocation.args(arguments);
        var argL = args.length;

        $ele = selector.query($ele)[0];

        if (argL === 3) {
            // .animate(element, name, callback);
            if (typeis.function(args[2])) {
                callback = args[2];
                options = {};
            }
            // .animate(element, name, options);
            else {
                callback = noop;
            }
        }
        // .animate(element, name);
        else if (argL === 2) {
            options = {};
            callback = noop;
        }

        options = dato.extend({}, keyframesDefaults, options);

        var queue = getProp($ele, propKeyframesKey);

        if (!queue) {
            setProp($ele, propKeyframesKey, queue = new Queue());
        }

        /**
         * 之前的任务出栈，永远保证只有一个任务在运行
         */
        queue.shift();
        queue.push(keyframes($ele, name, options), callback);
        queue.start();
    };


    /**
     * 清除过渡
     * @param $ele {Object|String} DOM 元素
     */
    exports.clearTransition = function ($ele) {
        $ele = selector.query($ele)[0];
        attribute.css($ele, {
            transitionDuration: '',
            transitionDelay: '',
            transitionTimingFunction: '',
            transitionProperty: ''
        });
    };



    /**
     * 清除动画
     * @param $ele {Object|String} DOM 元素
     */
    exports.clearAnimation = function ($ele) {
        $ele = selector.query($ele)[0];
        attribute.css($ele, {
            animationName: '',
            animationDuration: '',
            animationTimingFunction: '',
            animationDelay: '',
            animationIterationCount: '',
            animationDirection: '',
            animationPlayState: '',
            animationFillMode: ''
        });
    };

    ///**
    // * 暂停帧动画
    // * @param $ele {Object|String} DOM 元素
    // */
    //exports.pauseAnimation = function ($ele) {
    //    $ele = selector.query($ele)[0];
    //    var queue = getProp($ele, propKeyframesKey);
    //
    //    if (!queue) {
    //        setProp($ele, propKeyframesKey, queue = new Queue());
    //    }
    //
    //    queue.clear();
    //    attribute.css($ele, {
    //        animationPlayState: 'paused',
    //        animationFillMode: 'forward'
    //    });
    //};


    // 平滑滚动
    var scrollTo = function ($ele, to, options) {
        return function (next) {
            var from = {
                x: attribute.scrollLeft($ele),
                y: attribute.scrollTop($ele)
            };

            to.x = typeis.element(to.x) ? attribute.top(to.x) : number.parseFloat(to.x, from.x);
            to.y = typeis.element(to.y) ? attribute.top(to.y) : number.parseFloat(to.y, from.y);

            var totalDistance = {
                x: to.x - from.x,
                y: to.y - from.y
            };

            if (!totalDistance.x && !totalDistance.y) {
                return next();
            }

            var pastTime = 0;
            var beginTimestamp;
            var progress = function () {
                if (!beginTimestamp) {
                    beginTimestamp = Date.now();
                }

                // 时间超过 || 距离超过
                if (pastTime >= options.duration) {
                    if (totalDistance.x) {
                        attribute.scrollLeft($ele, to.x);
                    }

                    if (totalDistance.y) {
                        attribute.scrollTop($ele, to.y);
                    }

                    return next();
                }

                controller.nextFrame(function () {
                    pastTime = Date.now() - beginTimestamp;

                    var easing = eeeing.get(options.easing);
                    // 时间比 = 已耗时 / 总时间
                    var t = pastTime / options.duration;
                    // 当前值 = 开始值 + ( 结束值 - 开始值 ) * 时间比
                    var x = from.x + (to.x - from.x) * easing(t);
                    var y = from.y + (to.y - from.y) * easing(t);

                    if (totalDistance.x) {
                        attribute.scrollLeft($ele, x);
                    }

                    if (totalDistance.y) {
                        attribute.scrollTop($ele, y);
                    }

                    progress();
                });
            };

            setTimeout(progress, options.delay);
        };
    };


    /**
     * 平滑滚动
     * @param {Object|HTMLElement|Node|Window|Document|String} $ele 要滚动的元素
     * @param {Object} to 终点
     * @param {Object} [to.x] x轴终点
     * @param {Object} [to.y] y轴终点
     * @param {Object} [options] 配置
     * @param {Number} [options.duration=567] 动画时间，默认789，单位 ms
     * @param {String} [options.easing] 动画缓冲，默认 swing
     * 默认配置的缓冲函数有：linear、easeIn、easeOut、easeBoth、easeInStrong、easeOutStrong
     * easeBothStrong、easeOutQuart、easeInOutExpo、easeOutExpo、swing、swingFrom、swingTo
     * backIn、backOut、bounce、doubleSqrt，也可以自定义缓冲函数，只有一个参数t，表示时间比 = 已耗时 / 总时间，
     * 计算值=开始值 + ( 结束值 - 开始值 ) * 时间比
     * @param {Number} [options.delay] 动画延时，默认0，单位ms
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
    exports.scrollTo = function ($ele, to, options, callback) {
        var args = allocation.args(arguments);
        var argL = args.length;

        $ele = selector.query($ele)[0];

        if (argL === 3) {
            // .scrollTop($ele, to, callback);
            if (typeis.function(args[2])) {
                options = {};
                callback = args[2];
            }
            // .scrollTop($ele, to, options);
            else {
                callback = noop;
            }
        } else if (argL === 2) {
            options = {};
            callback = noop;
        }

        options = dato.extend({}, transitionDefaults, options);

        var queue = getProp($ele, propScrollToKey);

        if (!queue) {
            setProp($ele, propScrollToKey, queue = new Queue());
        }

        /**
         * 之前的任务出栈，永远保证只有一个任务在运行
         */
        queue.shift();
        queue.push(scrollTo($ele, to, options), callback);
        queue.start();
    };
});

