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
    var dato = require('../utils/dato.js');
    var typeis = require('../utils/typeis.js');
    var allocation = require('../utils/allocation.js');
    var howdo = require('../utils/howdo.js');
    var string = require('../utils/string.js');
    var Emitter = require('./emitter.js');
    var validationMap = {};
    var namespace = 'alien-libs-validation';
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        isBreakOnInvalid: typeis.window(window) ? false : true,
        defaultMsg: '${path}字段不合法'
    };
    var Validation = klass.extends(Emitter).create({
        constructor: function (options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the._validateList = [];
            the._validateMap = {};
            the._aliasMap = {};
            the._validationMap = {};
            the._validateIndex = 0;
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
         * 获取字段别名
         * @param path
         * @returns {*}
         */
        getAlias: function (path) {
            return this._aliasMap[path] || path;
        },


        /**
         * 注册验证规则，按顺序执行验证
         * @param path {String} 字段
         * @param rule {String|Array|RegExp|Function} 验证规则，可以是静态规则，也可以添加规则
         * @param [msg] {String} 验证失败消息
         * @returns {Validation}
         */
        addRule: function (path, rule, msg) {
            var the = this;

            if (typeis.string(rule)) {
                rule = [rule];
            } else if (!typeis.array(rule)) {
                var name = namespace + the._validateIndex++;
                the._validationMap[name] = _fixValidationRule(rule, msg);
                rule = [name];
            }

            var index = the._validateMap[path];

            if (typeis.undefined(index)) {
                the._validateMap[path] = the._validateList.length;
                the._validateList.push({
                    path: path,
                    rules: rule
                });
            } else {
                the._validateList[index].rules = the._validateList[index].rules.concat(rule);
            }

            return the;
        },


        /**
         * 获取字段的规则
         * @param path {String}
         * @returns {Array}
         */
        getRules: function (path) {
            var the = this;
            var rules = [];

            dato.each(the._validateList, function (i, validate) {
                if (path === validate.path) {
                    rules = validate.rules;

                    return false;
                }
            });

            return rules;
        },


        /**
         * 返回待验证的数据
         * @param [path] {String} 字段
         * @returns {*}
         */
        getData: function (path) {
            if (path) {
                return this.data[path];
            }

            return this.data;
        },


        /**
         * 执行单部验证
         * @param data {Object} 待验证的数据
         * @param [callback] {Function} 验证回调
         * @returns {Validation}
         */
        validateOne: function (data, callback) {
            var path = Object.keys(data)[0];
            var the = this;
            var rules = the.getRules(path);

            the._validateOne(data, path, rules, callback);

            return the;
        },


        /**
         * 执行全部验证
         * @param data {Object} 待验证的数据
         * @param [callback] {Function} 验证回调
         * @returns {Validation}
         */
        validateAll: function (data, callback) {
            var the = this;
            var options = the._options;
            var path = '';

            if (the._isValidating) {
                return the;
            }

            the._isValidating = true;
            the.data = data;

            var complete = function () {
                if (typeis.function(callback)) {
                    callback.apply(the, arguments);
                }

                the._isValidating = false;
                the.emit('complete');
            };

            var hd = howdo
                // 遍历验证顺序
                .each(the._validateList, function (i, item, next) {
                    the._validateOne(data, path = item.path, item.rules, next);
                })
                .try(function () {
                    the.emit('success');
                })
                .catch(function (err) {
                    err = new Error(string.assign(err || options.defaultMsg, {
                        path: the._aliasMap[path] || path
                    }));

                    if (options.isBreakOnInvalid) {
                        the.emit('error', err, path);
                    }
                });

            if (options.isBreakOnInvalid) {
                hd.follow(complete);
            } else {
                hd.together(complete);
            }

            return the;
        },

        /**
         * 表单验证
         * @param data {Object} 验证数据
         * @param path {String} 字段
         * @param rules {Array} 验证规则
         * @param callback {Function} 验证回调
         * @private
         */
        _validateOne: function (data, path, rules, callback) {
            var the = this;
            var options = the._options;

            the.emit('beforevalidate', path);
            howdo
                // 遍历验证规则
                .each(rules, function (j, ruleName, next) {
                    var rule = the._validationMap[ruleName] || validationMap[ruleName];

                    if (!rule) {
                        throw 'rule `' + ruleName + '` is not found';
                    }

                    the.emit('validate', path, ruleName);
                    rule.call(the, data[path], next);
                })
                .try(function () {
                    the.emit('aftervalidate', path);
                })
                .catch(function (err) {
                    if (!options.isBreakOnInvalid) {
                        err = new Error(string.assign(err || options.defaultMsg, {
                            path: the._aliasMap[path] || path
                        }));
                        the.emit('error', err, path);
                    }
                })
                .follow(function () {
                    the.emit('aftervalidate', path);

                    if (typeis.function(callback)) {
                        callback.apply(the, arguments);
                    }
                });
        }
    });

    /**
     * 注册静态验证规则
     * @param name {String} 规则名称
     * @param rule {Function|RegExp} 规则回调，如果是异步的话，否则可以直接 return boolean 值
     * @param [msg] {String} 验证出错的消息，如果 callback 是函数的话，需要在内部传递
     */
    Validation.addRule = function (name, rule, msg) {
        if (validationMap[name] && DEBUG) {
            console.warn('override `' + name + '` rule');
        }

        validationMap[name] = _fixValidationRule(rule, msg);
    };


    /**
     * 返回静态规则
     * @param [name] {String} 规则名
     * @returns {Object|Function}
     */
    Validation.getRule = function (name) {
        return name ? validationMap[name] : validationMap;
    };

    Validation.defaults = defaults;

    //Validation.addRule('required', function (value, done) {
    //    var boolean = typeis(value) === 'file' ? true :
    //    ( typeis.array(value) || typeis(value) === 'filelist' ? value : (value || '') ).length > 0;
    //
    //    done(boolean ? null : '${path}不能为空');
    //});

    Validation.addRule('number', /^\d+$/, '${path}必须是数字');

    Validation.addRule('mobile', /^1\d{10}$/, '${path}必须是手机号');

    Validation.addRule('email', function (val) {
        return typeis.email(val);
    }, '${path}必须是邮箱');

    Validation.addRule('url', function (val) {
        return typeis.url(val);
    }, '${path}必须是 url 地址');

    module.exports = Validation;


    /**
     * 修正验证规则
     * @param rule {RegExp|Function} 验证规则
     * @param [msg] {String} 验证失败消息
     * @returns {Function} 合法的验证规则
     * @private
     */
    function _fixValidationRule(rule, msg) {
        var callback;

        // 布尔值
        if (typeis.regexp(rule)) {
            callback = function (value, done) {
                if (typeis.empty(value)) {
                    return done(msg);
                }

                done(rule.test(value) ? null : msg);
            };
        } else if (typeis.function(rule)) {
            // 同步的
            if (rule.length === 1) {
                callback = function (value, done) {
                    if (typeis.empty(value)) {
                        return done(msg);
                    }

                    done(rule(value) ? null : msg);
                };
            } else {
                callback = rule;
            }
        }

        return callback;
    }
});