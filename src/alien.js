/*!
 * alien 起点，全局的东西都注册在这个 module 下，
 * 比如 zIndex
 * @author ydr.me
 * @create 2015-01-10 17:52
 */


define(function (require, exports, module) {
    /**
     * @module alien
     */
    'use strict';

    var zIndex = 999;

    /**
     * 获取 zIndex
     * @returns {number}
     */
    exports.getZindex = function () {
        return zIndex++;
    };
});