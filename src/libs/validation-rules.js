/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-05 22:40
 */


define(function (require, exports, module) {
    /**
     * @module libs/validation-rules
     */

    'use strict';

    var typeis = require('../utils/typeis.js');

    exports.addRule('number', function (val, done) {
        done(/^\d+$/.test(val) ? null : '${path}必须是数字');
    });

    exports.addRule('mobile', function (val, done) {
        done(/^1\d{10}$/.test(val) ? null : '${path}必须是手机号');
    });

    exports.addRule('email', function (val, done) {
        done(typeis.email(val) ? null : '${path}必须是邮箱');
    });

    exports.addRule('url', function (val, done) {
        done(typeis.url(val) ? null : '${path}必须是 url 地址');
    });
});