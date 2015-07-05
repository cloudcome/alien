/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-05 22:40
 */


define(function (require, exports, module) {
    /**
     * @module libs/validation-rules
     * @requires utils/typeis
     * @requires utils/number
     */

    'use strict';

    var typeis = require('../utils/typeis.js');
    var number = require('../utils/number.js');
    var REG_NUMBERIC = /^[\d.]+$/;

    module.exports = function (Validation) {
        Validation.addRule('number', function (val, done) {
            done(/^\d+$/.test(val) ? null : '${path}必须是数字');
        });


        Validation.addRule('mobile', function (val, done) {
            done(/^1\d{10}$/.test(val) ? null : '${path}必须是手机号');
        });


        Validation.addRule('email', function (val, done) {
            done(typeis.email(val) ? null : '${path}必须是邮箱');
        });


        Validation.addRule('url', function (val, done) {
            done(typeis.url(val) ? null : '${path}必须是 url 地址');
        });


        Validation.addRule('required', function (val, done) {
            var boolean = typeis(val) === 'file' ? true :
            (_isMultiple(val) ? val : (val || '')).length > 0;

            done(boolean ? null : '${path}不能为空');
        });


        Validation.addRule('minLength', function (val, done, param0) {
            var isMultiple = _isMultiple(val);
            var boolean = (isMultiple ? val : (val || '')).length >= param0;

            done(boolean ? null : '${path}' +
                (isMultiple ? '至少需要选择' + param0 + '项' : '不能少于' + param0 + '个字符')
            );
        });


        Validation.addRule('maxLength', function (val, done, param0) {
            var isMultiple = _isMultiple(val);
            var boolean = (isMultiple ? val : (val || '')).length >= param0;

            done(boolean ? null : '${path}' +
                (isMultiple ? '最多只能选择' + param0 + '项' : '不能超过' + param0 + '个字符')
            );
        });


        Validation.addRule('equal', function (val, done, param0) {
            val = val || '';
            done(val === this.getData(param0) ? null : '${path}必须与' + this.getAlias(param0) + '相同');
        });


        Validation.addRule('min', function (val, done, param0) {
            val = val || '';

            if (!REG_NUMBERIC.test(val)) {
                return done('${path}必须为数值格式');
            }

            val = number.parseFloat(val);
            param0 = number.parseFloat(param0);
            done(val >= param0 ? null : '${path}不能小于' + param0);
        });


        Validation.addRule('max', function (val, done, param0) {
            val = val || '';

            if (!REG_NUMBERIC.test(val)) {
                return done('${path}必须为数值格式');
            }

            val = number.parseFloat(val);
            param0 = number.parseFloat(param0);
            done(val <= param0 ? null : '${path}不能大于' + param0);
        });
    };


    //============================================================
    //============================================================
    //============================================================

    /**
     * 判断是否为多值类型
     * @param obj
     * @returns {boolean}
     */
    function _isMultiple(obj) {
        return typeis.array(obj) || typeis(obj) === 'filelist';
    }
});