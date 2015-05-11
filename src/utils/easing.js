/*!
 * easing.js
 * @author ydr.me
 * @create 2014-10-06 18:06
 */


define(function (require, exports, module) {
    /**
     * @module utils/easing
     * @link https://github.com/gre/bezier-easing/blob/master/index.js
     * @requires utils/dato
     * @requires utils/number
     */
    'use strict';
    //var pow = Math.pow;
    //var PI = Math.PI;
    //var BACK_CONST = 1.70158;
    // These values are established by empiricism with tests (tradeoff: performance VS precision)
    var NEWTON_ITERATIONS = 4;
    var NEWTON_MIN_SLOPE = 0.001;
    var SUBDIVISION_PRECISION = 0.0000001;
    var SUBDIVISION_MAX_ITERATIONS = 10;
    var KSPLINETABLESIZE = 11;
    var KSAMPLESTEPSIZE = 1.0 / (KSPLINETABLESIZE - 1.0);
    var win = window;
    var float32ArraySupported = 'Float32Array' in win;
    var dato = require('./dato.js');
    var number = require('./number.js');
    var aaaa = function (aA1, aA2) {
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    };

    var bbbb = function (aA1, aA2) {
        return 3.0 * aA2 - 6.0 * aA1;
    };

    var cccc = function (aA1) {
        return 3 * aA1;
    };

    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    var calcBezier = function (aT, aA1, aA2) {
        return ((aaaa(aA1, aA2) * aT + bbbb(aA1, aA2)) * aT + cccc(aA1)) * aT;
    };


    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    var getSlope = function (aT, aA1, aA2) {
        return 3.0 * aaaa(aA1, aA2) * aT * aT + 2.0 * bbbb(aA1, aA2) * aT + cccc(aA1);
    };

    var binarySubdivide = function (aX, aA, aB, mX1, mX2) {
        var currentX, currentT, i = 0;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            } else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
        return currentT;
    };

    /**
     * 贝塞尔曲线生成器
     * @param mX1
     * @param mY1
     * @param mX2
     * @param mY2
     * @returns {Function}
     */
    var cubicBezierGenerator = function (mX1, mY1, mX2, mY2) {
        mX1 = number.parseFloat(mX1, 0.25);
        mY1 = number.parseFloat(mY1, 0.1);
        mX2 = number.parseFloat(mX2, 0.25);
        mY2 = number.parseFloat(mY2, 0.1);

        var mSampleValues = float32ArraySupported ? new Float32Array(KSPLINETABLESIZE) : new Array(KSPLINETABLESIZE);

        function newtonRaphsonIterate(aX, aGuessT) {
            for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
                var currentSlope = getSlope(aGuessT, mX1, mX2);

                if (currentSlope === 0) {
                    return aGuessT;
                }

                var currentX = calcBezier(aGuessT, mX1, mX2) - aX;

                aGuessT -= currentX / currentSlope;
            }
            return aGuessT;
        }

        function calcSampleValues() {
            for (var i = 0; i < KSPLINETABLESIZE; ++i) {
                mSampleValues[i] = calcBezier(i * KSAMPLESTEPSIZE, mX1, mX2);
            }
        }

        function getTForX(aX) {
            var intervalStart = 0.0;
            var currentSample = 1;
            var lastSample = KSPLINETABLESIZE - 1;

            for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
                intervalStart += KSAMPLESTEPSIZE;
            }

            --currentSample;

            // Interpolate to provide an initial guess for t
            var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]);
            var guessForT = intervalStart + dist * KSAMPLESTEPSIZE;
            var initialSlope = getSlope(guessForT, mX1, mX2);

            if (initialSlope >= NEWTON_MIN_SLOPE) {
                return newtonRaphsonIterate(aX, guessForT);
            } else if (initialSlope === 0.0) {
                return guessForT;
            } else {
                return binarySubdivide(aX, intervalStart, intervalStart + KSAMPLESTEPSIZE, mX1, mX2);
            }
        }

        var _precomputed = false;

        function precompute() {
            _precomputed = true;

            if (mX1 !== mY1 || mX2 !== mY2) {
                calcSampleValues();
            }
        }

        var f = function (aX) {
            if (!_precomputed) {
                precompute();
            }

            // linear
            if (mX1 === mY1 && mX2 === mY2) {
                return aX;
            }

            // Because JavaScript number are imprecise, we should guarantee the extremes are right.

            if (aX === 0) {
                return 0;
            }

            if (aX === 1) {
                return 1;
            }

            return calcBezier(getTForX(aX), mY1, mY2);
        };

        f.getControlPoints = function () {
            return [{x: mX1, y: mY1}, {x: mX2, y: mY2}];
        };

        var args = [mX1, mY1, mX2, mY2];
        var css = "cubic-bezier(" + args + ")";

        f.toCSS = function () {
            return css;
        };

        return f;
    };


    //// 与 CSS3 保持一致
    //// 只需要传递一个参数即可
    //// t 为时间比 => 已耗时 / 总时间
    //// 值 = 开始值 + ( 结束值 - 开始值 ) * 时间比;
    //exports.js = {};


    /**
     * 贝塞尔曲线
     * @type {Object}
     */
    var easingDefineMap = {
        ease: [0.25, 0.1, 0.25, 1],
        linear: [0, 0, 1, 1],
        snap: [0, 1, 0.5, 1],
        in: [0.42, 0, 1, 1],
        out: [0, 0, 0.58, 1],
        'in-out': [0.42, 0, 0.58, 1],
        'in-quad': [0.55, 0.085, 0.68, 0.53],
        'in-cubic': [0.55, 0.055, 0.675, 0.19],
        'in-quart': [0.895, 0.03, 0.685, 0.22],
        'in-quint': [0.755, 0.05, 0.855, 0.06],
        'in-sine': [0.470, 0, 0.745, 0.715],
        'in-expo': [0.950, 0.05, 0.795, 0.035],
        'in-circ': [0.6, 0.04, 0.98, 0.335],
        'in-back': [0.6, -0.28, 0.735, 0.045],
        'out-quad': [0.25, 0.46, 0.45, 0.94],
        'out-cubic': [0.215, 0.61, 0.355, 1],
        'out-quart': [0.165, 0.84, 0.44, 1],
        'out-quint': [0.23, 1, 0.32, 1],
        'out-sine': [0.39, 0.575, 0.565, 1],
        'out-expo': [0.19, 1, 0.22, 1],
        'out-circ': [0.075, 0.82, 0.165, 1],
        'out-back': [0.175, 0.885, 0.32, 1.275],
        'in-out-quart': [0.770, 0, 0.175, 1],
        'in-out-quint': [0.860, 0, 0.07, 1],
        'in-out-sine': [0.445, 0.05, 0.55, 0.95],
        'in-out-expo': [1, 0, 0, 1],
        'in-out-circ': [0.785, 0.135, 0.15, 0.86],
        'in-out-back': [0.68, -0.55, 0.265, 1.55]
    };
    var easeingBuildMap = {};
    var defaultEasingName = 'ease';


    /**
     * 定义一个 easing
     * @param name
     * @param mX1
     * @param mY1
     * @param mX2
     * @param mY2
     * @returns {Function}
     */
    exports.define = function (name, mX1, mY1, mX2, mY2) {
        var f = cubicBezierGenerator(mX1, mY1, mX2, mY2);

        easeingBuildMap[name] = f;

        return f;
    };


    /**
     * 获取 easing function
     * @param name
     * @returns {Function}
     */
    exports.get = function (name) {
        // 读取已经生成的 easing function
        var easing = easeingBuildMap[name];

        if (easing) {
            return easing;
        }

        // 读取配置
        var arr = easingDefineMap[name];

        // 配置不存在
        if (!arr) {
            name = defaultEasingName;
        }

        // 判断是否存在刚才默认化的 easing
        easing = easeingBuildMap[name];

        if (easing) {
            return easing;
        }

        arr = easingDefineMap[name];
        easing = cubicBezierGenerator.apply(win, arr);
        easeingBuildMap[name] = easing;

        return easing;
    };
});
