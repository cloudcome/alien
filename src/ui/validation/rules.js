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
    var number = require('../../utils/number.js');
    var string = require('../../utils/string.js');
    var dato = require('../../utils/dato.js');
    var REG_NUMBERIC = /^[\d.]+$/;
    var REG_ACCEPT = /^(.*?)\/(.*)$/;

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

    // 至少个
    exports.atLeast = function (ruleValue) {
        return function (value, done) {
            value = value || [];
            done(value.length >= ruleValue ? null : '${path}至少需要选择' + ruleValue + '项');
        };
    };

    // 最多个
    exports.atMost = function (ruleValue) {
        return function (value, done) {
            value = value || [];
            done(value.length <= ruleValue ? null : '${path}最多只能选择' + ruleValue + '项');
        };
    };

    // 最小值
    exports.min = function (ruleValue) {
        return function (value, done) {
            value = value || '';

            if (!REG_NUMBERIC.test(value)) {
                return done('${path}必须为数值格式');
            }

            value = number.parseFloat(value);
            ruleValue = number.parseFloat(ruleValue);
            done(value >= ruleValue ? null : '${path}不能小于' + ruleValue);
        };
    };

    // 最大值
    exports.max = function (ruleValue) {
        return function (value, done) {
            value = value || '';

            if (!REG_NUMBERIC.test(value)) {
                return done('${path}必须为数值格式');
            }

            value = number.parseFloat(value);
            ruleValue = number.parseFloat(ruleValue);
            done(value <= ruleValue ? null : '${path}不能大于' + ruleValue);
        };
    };


    // 允许文件类型
    exports.accept = function (ruleValue) {
        return function (files, done) {
            var invalidIndexs = [];
            var isMultiple = typeis.array(files);

            if (!isMultiple) {
                files = [files];
            }

            dato.each(files, function (index, file) {
                if (file && file.type && !string.glob(file.type, ruleValue, true)) {
                    invalidIndexs.push(index + 1);
                }
            });

            done(invalidIndexs.length ? '${path}' +
            (isMultiple ? '第' + (invalidIndexs.join('、')) + '个' : '') +
            '文件类型不合法' : null);
        };
    };


    function calSize(size){

    }


    // 最小文件容量
    exports.minSize = function (ruleValue) {
        return function (files, done) {
            var invalidIndexs = [];
            var isMultiple = typeis.array(files);

            if (!isMultiple) {
                files = [files];
            }

            dato.each(files, function (index, file) {
                if (file && file.size && file.size < ruleValue) {
                    invalidIndexs.push(index + 1);
                }
            });

            done(invalidIndexs.length ? '${path}' +
            (isMultiple ? '第' + (invalidIndexs.join('、')) + '个' : '') +
            '文件大小不能小于' + number.abbr(ruleValue).toUpperCase() + 'B' : null);
        };
    };

    // 最大文件容量
    exports.maxSize = function (ruleValue) {
        return function (files, done) {
            var invalidIndexs = [];
            var isMultiple = typeis.array(files);

            if (!isMultiple) {
                files = [files];
            }

            dato.each(files, function (index, file) {
                if (file && file.size && file.size > ruleValue) {
                    invalidIndexs.push(index + 1);
                }
            });

            done(invalidIndexs.length ? '${path}' +
            (isMultiple ? '第' + (invalidIndexs.join('、')) + '个' : '') +
            '文件大小不能超过' + number.abbr(ruleValue).toUpperCase() + 'B' : null);
        };
    };
});