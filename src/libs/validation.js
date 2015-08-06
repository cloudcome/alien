/*!
 * 表单验证
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
    /**
     * @type {{}}
     * @exmaple
     * {
     *     // val 值
     *     // param 参数值
     *     // done 验证结束回调
     *     minLength: function (val, done, param0, param1, ...) {
     *        // done(null); done(null)表示没有错误
     *        // done('${path}的长度不足xx字符')
     *     }
     * }
     */
    var validationMap = {};
    var namespace = 'alien-libs-validation';
    var alienIndex = 0;
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        breakOnInvalid: typeis.window(window) ? false : true,
        defaultMsg: '${path}字段不合法'
    };
    var Validation = klass.extends(Emitter).create({
        /**
         * constructor
         * @extends Emitter
         * @param options
         */
        constructor: function (options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the._validateList = [];
            the._validateIndexMap = {};
            the._aliasMap = {};
            the._validationMap = {};
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
            return this._aliasMap[path];
        },


        /**
         * 注册验证规则，按顺序执行验证
         * @param path {String} 字段
         * @param nameOrfn {String|Function} 验证规则，可以是静态规则，也可以添加规则
         * @returns {Validation}
         */
        addRule: function (path, nameOrfn/*arguments*/) {
            var the = this;
            var args = allocation.args(arguments);
            var params = args.slice(2);
            var index = the._validateIndexMap[path];

            if (typeis.undefined(index)) {
                index = the._validateIndexMap[path] = the._validateList.length;
                the._validateList.push({
                    path: path,
                    rules: []
                });
            }

            if (typeis.string(nameOrfn)) {
                var name = nameOrfn;

                if (!validationMap[name]) {
                    throw 'can not found `' + name + '` validation';
                }

                the._validateList[index].rules.push({
                    name: name,
                    params: params,
                    fn: validationMap[name]
                });
            } else if (typeis.function(nameOrfn)) {
                the._validateList[index].rules.push({
                    name: namespace + alienIndex++,
                    params: params,
                    fn: nameOrfn
                });
            }

            return the;
        },


        /**
         * 获取字段的规则
         * @param [path] {String} 字段
         * @returns {Array}
         */
        getRules: function (path) {
            var the = this;

            if (!path) {
                return the._validateList;
            }

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
         * 获取字段验证规则的参数
         * @param path
         * @param name
         * @returns {*|Array}}
         */
        getRuleParams: function (path, name) {
            var the = this;
            var rules = the.getRules(path);
            var rule;

            dato.each(rules, function (index, _rule) {
                if (_rule.name === name) {
                    rule = _rule;
                    return false;
                }
            });

            return rule && rule.params;
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

            /**
             * 单个验证之前
             * @event beforevalidateone
             * @param path {String} 字段
             */
            the.emit('beforevalidateone', path);
            the._validateOne(data, path, rules, function () {
                /**
                 * 单个验证之后
                 * @event aftervalidateone
                 * @param path {String} 字段
                 */
                the.emit('aftervalidateone', path);

                if (typeis.function(callback)) {
                    callback.apply(this, arguments);
                }
            });

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
            /**
             * 全部验证之前
             * @event beforevalidateall
             */
            the.emit('beforevalidateall');
            var errorLength = 0;
            var complete = function () {
                if (typeis.function(callback)) {
                    callback.apply(the, arguments);
                }

                the._isValidating = false;
                /**
                 * 全部验证之后
                 * @event aftervalidateall
                 */
                the.emit('aftervalidateall');
            };
            var firstInvlidPath = null;

            howdo
                // 遍历验证顺序
                .each(the._validateList, function (i, item, next) {
                    the._validateOne(data, path = item.path, item.rules, function (err, hasError) {
                        if (hasError) {
                            if(!firstInvlidPath){
                                firstInvlidPath = item.path;
                            }

                            errorLength++;
                        }

                        next(err);
                    });
                })
                .try(function () {
                    if (errorLength) {
                        /**
                         * 验证成功
                         * @event error
                         */
                        the.emit('error', firstInvlidPath);
                    } else {
                        /**
                         * 验证成功
                         * @event success
                         */
                        the.emit('success');
                    }
                })
                .catch(function (err) {
                    if (options.breakOnInvalid) {
                        err = new Error(string.assign(err || options.defaultMsg, {
                            path: the._aliasMap[path] || path
                        }));

                        /**
                         * 验证失败
                         * @event invalid
                         * @param error {Object} 错误对象
                         * @param path {String} 字段
                         */
                        the.emit('invalid', err, path);
                    }

                    /**
                     * 验证失败
                     * @event error
                     */
                    the.emit('error', path);
                })
                .follow(complete);

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

            /**
             * 验证之前
             * @event beforevalidate
             * @param path {String} 字段
             */
            the.emit('beforevalidate', path);
            howdo
                // 遍历验证规则
                .each(rules, function (j, rule, next) {
                    var args = [data[path], next];

                    the.emit('validate', path, rule.name);
                    args = args.concat(rule.params);
                    the.path = path;
                    rule.fn.apply(the, args);
                })
                .try(function () {
                    /**
                     * 验证成功
                     * @event valid
                     * @param path {String} 字段
                     */
                    the.emit('valid', path);

                    /**
                     * 验证之后
                     * @event aftervalidate
                     * @param path {String} 字段
                     */
                    the.emit('aftervalidate', path);

                    if (typeis.function(callback)) {
                        callback.call(the, null, false);
                    }
                })
                .catch(function (err) {
                    // 验证失败即断开
                    if (options.breakOnInvalid) {
                        /**
                         * 验证之后
                         * @event aftervalidate
                         * @param path {String} 字段
                         */
                        the.emit('aftervalidate', path);

                        if (typeis.function(callback)) {
                            callback.call(the, err, true);
                        }
                    } else {
                        err = new Error(string.assign(err || options.defaultMsg, {
                            path: the._aliasMap[path] || path
                        }));

                        /**
                         * 验证失败
                         * @event invalid
                         * @param error {Object} 错误对象
                         * @param path {String} 字段
                         */
                        the.emit('invalid', err, path);

                        /**
                         * 验证之后
                         * @event aftervalidate
                         * @param path {String} 字段
                         */
                        the.emit('aftervalidate', path);

                        if (typeis.function(callback)) {
                            callback.call(the, null, true);
                        }
                    }
                })
                .follow();
        }
    });

    /**
     * 注册静态验证规则
     * @param name {String} 规则名称
     * @param fn {Function} 规则回调
     *
     * @example
     * Validation.addRule('number', function (val, done, param0, param1, ...) {
     *    done(/^\d+$/.test(val) ? null : '${path}必须是数字');
     * });
     */
    Validation.addRule = function (name, fn/*arguments*/) {
        if (validationMap[name] && DEBUG) {
            console.warn('override `' + name + '` rule');
        }

        validationMap[name] = fn;
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
    module.exports = Validation;
});