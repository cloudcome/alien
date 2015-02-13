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
     * @requires util/easing
     * @requires core/navigator/compatible
     * @requires core/event/base
     */
    'use strict';

    var udf;
    var attribute = require('./attribute.js');
    var see = require('./see.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var eeeing = require('../../util/easing.js');
    var compatible = require('../navigator/compatible.js');
    var event = require('../event/base.js');
    var cssDefaults = {
        easing: 'in-out',
        duration: 567,
        delay: 0
    };
    var jsDefaults = {
        easing: 'swing',
        duration: 567,
        delay: 0
    };
    var animationDefaults = {
        name: '',
        easing: 'in-out',
        duration: 567,
        delay: 0,
        count: 1,
        direction: 'normal'
    };
    var css = 'transition-property';
    //var transitionendEventPrefix = compatible.css3(css).replace(css, '').replace(/-/g, '');
    //var transitionendEventType = transitionendEventPrefix ? transitionendEventPrefix + 'TransitionEnd' : 'transitionend';
    //var animationendEventType = compatible.html5('onanimationend', window, true);
    //var animationiterationEventType = compatible.html5('onanimationiteration', window, true);
    var animationendEventType = 'webkitAnimationEnd oanimationend msAnimationEnd mozAnimationEnd animationend';
    var animationiterationEventType = 'webkitAnimationIteration oAnimationIteration msAnimationIteration mozAnimationIteration animationiteration';
    var transitionendEventType = 'webkitTransitionEnd oTransitionEnd msTransitionEnd mozTransitionEnd transitionend';
    var noop = function () {
        // ignore
    };
    var alienKey = 'alien-core-dom-animation-';
    var index = 0;
    var animationMap = {};
    var requestAnimationFrame = compatible.html5('requestAnimationFrame', window);

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
     * @param {Number} [options.duration=567] 动画时间，默认789，单位ms
     * @param {Number} [options.delay=0] 延迟时间，默认0，单位ms
     * @param {Function} [callback] 回调
     *
     * @example
     * animation.animate(ele, to);
     * animation.animate(ele, to, property);
     * animation.animate(ele, to, callback);
     * animation.animate(ele, to, property, callback);
     */
    exports.animate = function (ele, to, options, callback) {
        if (attribute.css(ele, 'display') === 'none') {
            return;
        }

        if (!ele[alienKey]) {
            ele[alienKey] = ++index;
        }

        var id = ele[alienKey];
        var args = arguments;
        var argL = args.length;
        var keys = [];
        var hasDispatch = false;
        // 修正 CSS 终点
        var fixTo = {};
        var durationVal = [];
        var delayVal = [];
        var easingVal = [];
        var i = 0;

        // 如果正在动画，则停止当前动画
        if (animationMap[id]) {
            exports.stop(ele);
        }

        options = dato.extend({}, cssDefaults, options);
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

        var listener = function (eve) {
            if (timeid) {
                clearTimeout(timeid);
                timeid = 0;
            }

            if (eve === true || eve && eve.target === ele) {
                if (hasDispatch) {
                    return;
                }

                hasDispatch = true;
                animationMap[id] = null;
                event.un(ele, transitionendEventType, listener);
                attribute.css(ele, {
                    transitionDuration: '',
                    transitionDelay: '',
                    transitionTimingFunction: '',
                    transitionProperty: ''
                });

                window[requestAnimationFrame](callback.bind(ele));
            }
        };


        event.on(ele, transitionendEventType, listener);
        var timeid = setTimeout(function () {
            listener(true);
        }, options.duration + options.delay + 20);
        options = dato.extend({}, cssDefaults, options);

        var easing = eeeing.css3[options.easing];

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


        if (see.visibility(ele) === 'visible') {
            attribute.css(ele, {
                transitionDuration: durationVal.join(','),
                transitionDelay: delayVal.join(','),
                transitionTimingFunction: easingVal.join(','),
                transitionProperty: keys.join(',')
            });
        } else {
            listener(true);
        }

        window[requestAnimationFrame](function () {
            attribute.css(ele, fixTo);
        });
    };


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
    exports.stop = function (ele, toEnd) {
        var id = ele[alienKey];
        var to;

        if (!id || !(to = animationMap[id])) {
            return;
        }

        if (!toEnd) {
            dato.each(to, function (key) {
                attribute.css(ele, key, attribute.css(ele, key));
            });
        }

        attribute.css(ele, {
            transitionDuration: '',
            transitionDelay: '',
            transitionTimingFunction: '',
            transitionProperty: ''
        });
        event.dispatch(ele, transitionendEventType);
    };


    // animation-name	规定需要绑定到选择器的 keyframe 名称。。
    // animation-duration	规定完成动画所花费的时间，以秒或毫秒计。
    // animation-timing-function	规定动画的速度曲线。
    // animation-delay	规定在动画开始之前的延迟。
    // animation-iteration-count	规定动画应该播放的次数。
    // animation-direction	规定是否应该轮流反向播放动画。
    /**
     * 运行一段帧动画，并监听动画回调
     * @param ele {HTMLElement|Node} 元素
     * @param options {Object} 配置
     * @param options.name {String} 关键帧名称
     * @param [options.duration=567] {Number} 动画时间
     * @param [options.delay=0] {Number} 开始动画延迟时间
     * @param [options.easing="in-out"] {String} 动画缓冲类型
     * @param [options.count=1] {Number} 动画次数
     * @param [options.direction="normal"] {String} 动画方向，可选 normal、alternate
     * @param [onanimationend] {Function} 动画结束回调
     * @param [onanimationiteration] {Function} 动画迭代回调
     */
    exports.keyframes = function (ele, options, onanimationend, onanimationiteration) {
        options = dato.extend({}, animationDefaults, options);

        if (!options.name) {
            return;
        }

        var easing = eeeing.css3[options.easing];

        if (!easing) {
            easing = options.easing;
        }

        var css = {
            animationName: options.name,
            animationDuration: options.duration + 'ms',
            animationTimingFunction: easing,
            animationDelay: options.delay + 'ms',
            animationIterationCount: options.count,
            animationDirection: options.direction
        };
        
        event.on(ele, animationiterationEventType, onanimationiteration);
        event.once(ele, animationendEventType, function (eve) {
            if (options.name === eve.animationName) {
                onanimationend = typeis.function(onanimationend) ? onanimationend : noop;
                onanimationend.apply(ele, arguments);
            }
            
            event.un(ele, animationiterationEventType, onanimationiteration);

            attribute.css(ele, {
                animationName: '',
                animationDuration: '',
                animationTimingFunction: '',
                animationDelay: '',
                animationIterationCount: '',
                animationDirection: ''
            });
        });
        attribute.css(ele, css);
    };


    /**
     * 平滑滚动
     * @param {HTMLElement|Node|window|document} ele 要滚动的元素
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
    exports.scrollTo = function (ele, to, options, callback) {
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

        if (typeis(callback) !== 'function') {
            callback = noop;
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
    };
});

