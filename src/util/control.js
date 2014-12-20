/*!
 * 执行控制
 * @author ydr.me
 * @create 2014-12-20 16:42
 */


define(function (require, exports, module) {
    /**
     * @module util/control
     */
    'use strict';

    /**
     * 控制执行
     * @param fn
     * @param wait
     * @param isFirstTime
     * @returns {Function}
     */
    exports.debounce = function (fn, wait, isFirstTime) {
        var timer = 0;

        wait = wait || 123;

        return function () {
            var the = this;
            var args = arguments;

            if (timer) {
                clearTimeout(timer);
            }

            if (isFirstTime) {
                fn.apply(the, args);
            }

            timer = setTimeout(function () {
                fn.apply(the, args);
                timer = 0;
            }, wait);
        };
    };
});