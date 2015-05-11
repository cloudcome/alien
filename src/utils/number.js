/*!
 * 数字相关
 * @author ydr.me
 * @create 2015-05-11 13:54
 */


define(function (require, exports, module) {
    /**
     * @module utils/number
     */

    'use strict';

    var abbrStr = 'kmt';

    /**
     * 整数化
     * @param num {*} 待转换对象
     * @param [dftNum=0] {*} 当为 NaN 时的默认值
     * @returns {*}
     */
    exports.parseInt = function (num, dftNum) {
        num = parseInt(num, 10);

        return Number.isNaN(num) ? dftNum : num;
    };


    /**
     * 浮点化
     * @param num {*} 待转换对象
     * @param [dftNum=0] {*} 当为 NaN 时的默认值
     * @returns {*}
     */
    exports.parseFloat = function (num, dftNum) {
        num = parseFloat(num);

        return Number.isNaN(num) ? dftNum : num;
    };

    exports.abbr = function (num, fixedLength) {

    };
});















