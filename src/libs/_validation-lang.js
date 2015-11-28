/*!
 * 验证语法
 * @author ydr.me
 * @create 2015-08-20 15:30
 */


define(function (require, exports, module) {
    /**
     * @module libs/validation-lang
     */

    'use strict';


    var lang = {
        minLength: {
            input: '${1}不能少于${2}个字符',
            select: '${1}至少需要选择${2}项'
        },
        maxLength: {
            input: '${1}不能超过${2}个字符',
            select: '${1}最多只能选择${2}项'
        },
        least: '${1}至少需要选择${2}项',
        most: '${1}最多只能选择${2}项',
        type: {
            number: '${1}必须是数值格式',
            integer: '${1}必须是整数',
            mobile: '${1}必须是手机号',
            email: '${1}必须是邮箱格式',
            url: '${1}必须是网址'
        },
        required: '${1}不能为空',
        equal: '${1}必须与${2}相同',
        min: '${1}不能小于${2}',
        max: '${1}不能大于${2}',
        step: '${1}步进值必须为${2}'
    };


    /**
     * 获取 lang
     * @param type
     * @param [category]
     * @returns {*}
     */
    exports.get = function (type, category) {
        var la = lang[type];

        if (!category) {
            return la;
        }

        return la && la[category] || '';
    };


    /**
     * 设置 lang
     * @param type
     * @param msg
     * @param [category]
     */
    exports.set = function (type, msg, category) {
        if (category) {
            lang[type] = lang[type] || {};
            lang[type][category] = msg;
        } else {
            lang[type] = msg;
        }
    };
});