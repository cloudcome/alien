/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-01 16:57
 */


define(function (require, exports, module) {
    /**
     * @module parent/validation
     */

    'use strict';

    var klass = require('../utils/class.js');
    var typeis = require('../utils/typeis.js');
    var allocation = require('../utils/allocation.js');
    var howdo = require('../utils/howdo.js');
    var Emitter = require('./emitter.js');
    var valitdationMap = {};
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        isBreakOnInvalid: typeis.window(window) ? false : true
    };
    var Validation = klass.extends(Emitter).create({
        constructor: function () {
            var the = this;

            the._list = [];
            the._map = {};
        },


        /**
         * 注册验证规则，按顺序执行验证
         * @param path
         * @param ruleList
         */
        addRule: function (path, ruleList) {
            var the = this;

            if (!typeis.array(ruleList)) {
                ruleList = [ruleList];
            }

            var index = the._map[path];

            if (typeis.undefined(index)) {
                the._map[path] = the._list.length;
                the._list.push({
                    path: path,
                    list: ruleList
                });
            } else {
                the._list[index].list = the._list[index].list.concat(ruleList);
            }

            return the;
        },


        /**
         * 执行验证
         * @param data
         */
        validate: function (data) {

        }
    });

    /**
     * 注册静态验证规则
     * @param name {String} 规则名称
     * @param callbackORregExp {Function|RegExp} 规则回调，如果是异步的话，否则可以直接 return boolean 值
     */
    Validation.addRule = function (name, callbackORregExp) {
        if (valitdationMap[name]) {
            console.warn('override validation name of `' + name + '`');
        }

        var callback;

        // 布尔值
        if (typeis.regexp(callbackORregExp)) {
            callback = function (value, done) {
                done(callbackORregExp.test(value));
            };
        } else {
            // 同步的
            if (callbackORregExp.length === 1) {
                callback = function (value, done) {
                    done(callbackORregExp(value));
                };
            } else {
                callback = callbackORregExp;
            }
        }

        valitdationMap[name] = callback;
    };

    window.validationMap = valitdationMap;
    Validation.defaults = defaults;
    module.exports = Validation;
});