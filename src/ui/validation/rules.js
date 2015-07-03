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
            done(value.length >= ruleValue ? null : '${path}不能少于' + ruleValue + '个长度');
        };
    };

    // 最大长度
    exports.maxLength = function (ruleValue) {
        return function (value, done) {
            value = value || '';
            done(value.length <= ruleValue ? null : '${path}不能超过' + ruleValue + '个长度');
        };
    };

    // 相等于
    exports.equal = function (ruleValue) {
        return function (value, done) {
            value = value || '';
            done(value === this.getData(ruleValue) ? null : '${path}必须与' + this.getAlias(ruleValue) + '相同');
        };
    };
});