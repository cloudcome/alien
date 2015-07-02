/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-02 14:28
 */


define(function (require, exports, module) {
    /**
     * @module parent/rules
     */

    'use strict';

    var typeis = require('../../utils/typeis.js');

    // 最小长度
    exports.minLength = function (ruleValue) {
        return function (value, done) {
            value = value || '';
            done(value.length >= ruleValue ? null : '${path}长度不能少于${0}');
        };
    };

    // 最大长度
    exports.maxLength = function (ruleValue) {
        return function (value, done) {
            value = value || '';
            done(value.length <= ruleValue ? null : '${path}长度不能超过${0}');
        };
    };
});