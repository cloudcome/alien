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

    var Validation = require('../../libs/validation.js');
    var typeis = require('../../utils/typeis.js');

    Validation.addRule('required', /^.+$/, '${path}必填');
    Validation.addRule('number', /^\d+$/, '${path}必须是数字');

    Validation.addRule('email', function (val) {
        return typeis.email(val);
    }, '${path}不符合 email 格式');

    Validation.addRule('url', function (val) {
        return typeis.url(val);
    }, '${path}不符合 url 格式');
});