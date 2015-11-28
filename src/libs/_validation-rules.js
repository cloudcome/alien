/*!
 * 验证规则库
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
    var string = require('../utils/string.js');
    var lang = require('./_validation-lang.js');
    var REG_NUMBERIC = /^-?[\d.]+$/;

    module.exports = function (Validation) {
        Validation.addRule('type', function (val, done, param0) {
            var the = this;
            var path = the.path;
            var isRequired = the.getRuleParams(path, 'required');
            var alias = the.getAlias(path) || path;

            // 非必填并且是空值
            if (!isRequired && !val) {
                return done(null);
            }

            switch (param0) {
                case 'number':
                    //return done(/^-?\d+$/.test(val) ? null : '${path}必须是数值格式');
                    return done(/^-?\d+$/.test(val) ? null : string.assign(lang.get('type', 'number'), alias, param0));

                case 'integer':
                    val = val.replace(/^-/, '');
                    //return done(/^[1-9]*\d$/.test(val) ? null : '${path}必须是整数');
                    return done(/^(0|[1-9]\d*)$/.test(val) ? null : string.assign(lang.get('type', 'integer'), alias, param0));

                case 'mobile':
                    //return done(/^1\d{10}$/.test(val) ? null : '${path}必须是手机号');
                    return done(/^1\d{10}$/.test(val) ? null : string.assign(lang.get('type', 'mobile'), alias, param0));

                case 'email':
                    //return done(typeis.email(val) ? null : '${path}必须是邮箱');
                    return done(typeis.email(val) ? null : string.assign(lang.get('type', 'email'), alias, param0));

                case 'url':
                    //return done(typeis.url(val) ? null : '${path}必须是 url 地址');
                    return done(typeis.url(val) ? null : string.assign(lang.get('type', 'url'), alias, param0));
            }
        });


        Validation.addRule('required', function (val, done) {
            var isMultiple = _isMultiple(val);
            var boolean = typeis(val) === 'file' ? true :
            (isMultiple ? val : (val || '')).length > 0;

            //done(boolean ? null : '${path}不能为空');
            done(boolean ? null : lang.get('required'));
        });


        var _createLength = function (type) {
            var typeMap = {
                0: 'minLength',
                1: 'maxLength'
            };

            return function (val, done, param0) {
                param0 = number.parseInt(param0);

                var isMultiple = _isMultiple(val);
                var length = (isMultiple ? val : (val || '')).length;
                var boolean = type === 0 ? length >= param0 : length <= param0;

                //done(boolean ? null : '${path}' +
                //    (isMultiple ? typeMap[type][0] + '选择' + param0 + '项' : '不能' + typeMap[type][1] + param0 + '个字符')
                //);

                if (isMultiple) {
                    done(boolean ? null : lang.get(typeMap[type], 'select'));
                } else {
                    done(boolean ? null : lang.get(typeMap[type], 'input'));
                }

                //done(boolean ? null : '${path}' +
                //    (isMultiple ? typeMap[type][0] + '选择' + param0 + '项' : '不能' + typeMap[type][1] + param0 + '个字符')
                //);
            };
        };

        Validation.addRule('minLength', _createLength(0));
        Validation.addRule('maxLength', _createLength(1));


        Validation.addRule('equal', function (val, done, param0) {
            val = val || '';
            done(val === this.getData(param0) ? null : '${1}必须与' + this.getAlias(param0) + '相同');
        });


        var _createNumber = function (type) {
            return function (val, done, param0) {
                val = val || '';

                var isRequired = this.getRuleParams(this.path, 'required');

                // 非必填并且是空值
                if (!isRequired && !val) {
                    return done(null);
                }

                if (!REG_NUMBERIC.test(val)) {
                    return done('${1}必须为数值格式');
                }

                val = number.parseFloat(val);
                param0 = number.parseFloat(param0);

                var boolean = type === 0 ? val >= param0 : val <= param0;

                done(boolean ? null : lang.get(type ? 'max' : 'min'));
            };
        };

        Validation.addRule('min', _createNumber(0));
        Validation.addRule('max', _createNumber(1));


        Validation.addRule('step', function (val, done, param0) {
            val = val || '';

            var isRequired = this.getRuleParams(this.path, 'required');

            // 非必填并且是空值
            if (!isRequired && !val) {
                return done(null);
            }

            if (!REG_NUMBERIC.test(val)) {
                return done('${1}必须为数值格式');
            }

            var min = this.getRuleParams(this.path, 'min')[0];

            val = number.parseInt(val, 0);
            param0 = number.parseInt(param0, 0);

            if (!param0) {
                return done(null);
            }

            done((val - min) % param0 ? '${1}递增步进值必须是' + param0 + '，最小值为' + min : null);
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