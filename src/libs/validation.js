/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-01 16:57
 */


define(function (require, exports, module) {
    /**
     * @module libs/validation
     * @requires utils/class
     * @requires utils/typeis
     * @requires utils/allocation
     * @requires utils/howdo
     * @requires utils/string
     * @requires libs/emitter
     */

    'use strict';

    var klass = require('../utils/class.js');
    var typeis = require('../utils/typeis.js');
    var allocation = require('../utils/allocation.js');
    var howdo = require('../utils/howdo.js');
    var string = require('../utils/string.js');
    var Emitter = require('./emitter.js');
    var valitdationMap = {};
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        isBreakOnInvalid: typeis.window(window) ? false : true,
        defaultMsg: '${path}字段不合法'
    };
    var Validation = klass.extends(Emitter).create({
        constructor: function () {
            var the = this;

            the._list = [];
            the._map = {};
            the._aliasMap = {};
        },


        /**
         * 为路径设置别名
         * @param path {String} 字段
         * @param alias {String} 别名
         * @returns {Validation}
         */
        setAlias: function (path, alias) {
            this._aliasMap[path] = alias;

            return this;
        },


        /**
         * 注册验证规则，按顺序执行验证
         * @param path
         * @param ruleList
         * @returns {Validation}
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
                    rules: ruleList
                });
            } else {
                the._list[index].rules = the._list[index].rules.concat(ruleList);
            }

            return the;
        },


        /**
         * 执行验证
         * @param data {Object} 待验证的数据
         * @returns {Validation}
         */
        validate: function (data) {
            var the = this;
            var options = the._options;
            var path = '';

            if (the._isValidate) {
                return the;
            }

            the._isValidate = false;

            howdo
                // 遍历验证顺序
                .each(the._list, function (i, item, next) {
                    the.emit('beforevalidate', path = item.path);
                    howdo
                        // 遍历验证规则
                        .each(item.rules, function (j, ruleName, next) {
                            var rule = valitdationMap[ruleName];

                            if (!rule) {
                                throw 'rule `' + ruleName + '` is not found';
                            }

                            the.emit('validate', item.path, ruleName);
                            rule.call(the, data[item.path], next);
                        })
                        .try(function () {
                            the.emit('aftervalidate', item.path);
                        })
                        .follow(next);
                })
                .try(function () {
                    the.emit('success');
                })
                .catch(function (err) {
                    err = new Error(string.assign(err || options.defaultMsg, {
                        path: the._aliasMap[path] || path
                    }));
                    the.emit('error', err);
                })
                .follow();
        }
    });

    /**
     * 注册静态验证规则
     * @param name {String} 规则名称
     * @param callbackORregExp {Function|RegExp} 规则回调，如果是异步的话，否则可以直接 return boolean 值
     * @param [msg] {String} 验证出错的消息，如果 callback 是函数的话，需要在内部传递
     */
    Validation.addRule = function (name, callbackORregExp, msg) {
        if (valitdationMap[name]) {
            console.warn('override validation name of `' + name + '`');
        }

        var callback;

        // 布尔值
        if (typeis.regexp(callbackORregExp)) {
            callback = function (value, done) {
                done(callbackORregExp.test(value) ? null : msg);
            };
        } else {
            // 同步的
            if (callbackORregExp.length === 1) {
                callback = function (value, done) {
                    done(callbackORregExp(value) ? null : msg);
                };
            } else {
                callback = callbackORregExp;
            }
        }

        valitdationMap[name] = callback;
    };

    Validation.defaults = defaults;
    module.exports = Validation;
});