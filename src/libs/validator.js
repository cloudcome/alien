/*!
 * 表单验证基础
 * @author ydr.me
 * @create 2014-10-05 23:29
 */


define(function (require, exports, module) {
    /**
     * @module libs/validator
     * @requires utils/class
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/howdo
     */
    'use strict';

    var klass = require('../utils/class.js');
    var dato = require('../utils/dato.js');
    var string = require('../utils/string.js');
    var typeis = require('../utils/typeis.js');
    var howdo = require('../utils/howdo.js');
    var Emitter = require('./emitter.js');
    var types = 'string,number,email,url,boolean'.split(',');
    var noop = function () {
        // ignore
    };
    var udf;
    var customRules = {};
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        isBreakOnInvalid: false
    };
    var Validator = klass.extends(Emitter).create({
        constructor: function (options) {
            var the = this;

            // 规则列表，有顺序之分
            the._ruleList = [];
            // 已经存在的验证规则
            the._ruleNames = {};
            the._customRules = {};
            the.rules = {};
            // 选项
            the._options = dato.extend(true, {}, defaults, options);
        },


        /**
         * 注册自定义的实例验证规则
         * @param options {Object} 规则配置
         * @param fn {Function} 规则方法
         * @param [isOverride=false] 是否覆盖已有规则
         *
         * @example
         * // 添加一个检查后缀的自定义规则
         * validator.registerRule({
         *     name: 'suffix',
         *     type: 'array'
         * }, function(suffix, val, next){
         *     var sf = (val.match(/\.[^.]*$/) || [''])[0];
         *     var boolean = suffix.indexOf(sf) > -1;
         *
         *     next(boolean ? null : new Error(this.alias + '的文件后缀不正确'), val);
         * });
         */
        registerRule: function (options, fn, isOverride) {
            var the = this;

            if (!the._customRules[options.name] || the._customRules[options.name] && isOverride) {
                the._customRules[options.name] = {
                    name: options.name,
                    type: options.type,
                    fn: fn
                };
            }
        },


        /**
         * 添加单个验证规则
         * @param {Object}     rule 验证规则对象
         * @param {String}     rule.name                数据字段名称【必须】
         * @param {String}     rule.type                数据类型【必须】
         * @param {String}     [rule.alias]             别称，否则在消息中字段名称以`name`输出
         * @param {Function}   [rule.onbefore]          验证前置：数据验证之前的处理回调
         * @param {Boolean}    [rule.exist=false]       验证前置：是否存在的时候才验证，默认false
         * @param {Boolean}    [rule.trim=true]         验证前置：是否去除验证数据的左右空白，默认true
         * @param {Boolean}    [rule.required]          验证规则：是否必填
         * @param {Number}     [rule.length]            验证规则：指定字符串数据的字符长度，仅当为字符串类型（string/email/url）有效
         * @param {Number}     [rule.minLength]         验证规则：指定字符串数据的最小字符长度，仅当为字符串类型（string/email/url）有效
         * @param {Number}     [rule.maxLength]         验证规则：指定字符串数据的最大字符长度，仅当为字符串类型（string/email/url）有效
         * @param {Number}     [rule.bytes]             验证规则：指定字符串数据的字节长度，仅当为字符串类型（string/email/url）有效
         * @param {Number}     [rule.minBytes]          验证规则：指定字符串数据的最小字节长度，仅当为字符串类型（string/email/url）有效
         * @param {Number}     [rule.maxBytes]          验证规则：指定字符串数据的最大字节长度，仅当为字符串类型（string/email/url）有效
         * @param {Number}     [rule.min]               验证规则：指定数字数据的最小值，仅当为数值类型（number）有效
         * @param {Number}     [rule.max]               验证规则：指定数字数据的最大值，仅当为数值类型（number）有效
         * @param {RegExp}     [rule.regexp]            验证规则：正则表达式，仅当为字符串类型（string/email/url）有效
         * @param {*}          [rule.equal]             验证规则：全等于指定值
         * @param {Array}      [rule.inArray]           验证规则：用数组指定范围值
         * @param {Function}   [rule.function]          验证规则：自定义验证函数，参数为`val`、`next`，可以是异步，最后执行`next(err);`即可
         * @param {Function}   [rule.onafter]           验证后置：数据验证之后的处理回调
         * @param {Object}     [rule.msg]               验证出错的消息
         * @param {Boolean}    [isOverride=false]       是否覆盖已经存在的验证规则，默认false
         *
         * @example
         * validator.pushRule({
         *    // 字段名称，必须，唯一性
         *    name: 'username',
         *    // 数据类型，必须，为 string/email/url/number/boolean/array 之一
         *    type: 'string',
         *    // 别称，当没有填写自定义错误消息时
         *    // 提示为 username不能为空
         *    // 当前设置别名之后
         *    // 提示为 用户名不能为空
         *    alias: '用户名',
         *
         *    // 验证前置
         *    // val 当前字段值
         *    // data 所有数据
         *    onbefore: function(val, data){
         *        return val + 'abc';
         *    },
         *    exist: false,
         *    trim: true,
         *
         *    // 验证规则
         *    required: true,
         *    length: 10,
         *    minLength: 4,
         *    maxLength: 12,
         *    bytes: 10,
         *    minBytes: 4,
         *    maxBytes: 12,
         *    min: 4,
         *    max: 4,
         *    regexp: /^[a-z]\w{3,11}$/,
         *    equal: 'cloudcome',
         *    inArray: ['cloudcome', 'yundanran'],
         *    // val 当前字段值
         *    // [data 所有数据] 可选
         *    // next 执行下一步
         *    function: function(val, next){
         *        // 这里可以是异步的
         *        // 比如远程校验可以写在这里
         *        ajax.post('./validate.json', {
         *            username: val
         *        }).on('success', function(json){
         *            if(json.code>0){
         *                next();
         *            }else{
         *                next(new Error(json.msg));
         *            }
         *        }).on('error', function(){
         *            next(new Error('网络连接错误，验证失败'));
         *        });
         *    },
         *
         *    // 验证消息
         *    msg: {
         *        required: '用户名不能为空',
         *        length: '用户名长度必须为10'
         *        // 未自定义的消息，以默认输出
         *        // 每个验证规则都必须配备一个消息体，
         *        // 除了自定义的`function`
         *    },
         *
         *    // 验证后置
         *    onafter: function(val){
         *        return val + 'abc';
         *    }
         * });
         */
        pushRule: function (rule, isOverride) {
            var the = this;
            var pushFn = function (father) {
                if (typeis.function(rule.onbefore)) {
                    father.onbefores.push(rule.onbefore);
                    rule.onbefore = udf;
                }

                if (typeis.function(rule.onafter)) {
                    father.onafters.push(rule.onafter);
                    rule.onafter = udf;
                }

                if (typeis.function(rule.function)) {
                    father.functions.push(rule.function);
                    rule.function = udf;
                }
            };
            // 是否存在
            var isExist = !!the._ruleNames[rule.name];

            if (!isExist || isOverride) {
                if (!rule.type || types.indexOf(rule.type) === -1) {
                    throw '`rule.type` must be one of [' + types.join('/') + ']';
                }

                if (!rule.msg) {
                    rule.msg = {};
                }

                if (!rule.alias) {
                    rule.alias = rule.name;
                }

                rule.required = !!rule.required;

                if (rule.exist === udf) {
                    rule.exist = false;
                }

                rule.exist = !!rule.exist;

                if (rule.trim === udf) {
                    rule.trim = true;
                }

                rule.trim = !!rule.trim;

                // 存在并且覆盖
                if (isExist && isOverride) {
                    the._ruleList.forEach(function (existRule) {
                        if (rule.name === existRule.name) {
                            existRule.onbefores = existRule.onbefores || [];
                            dato.extend(true, existRule, rule);
                            the.rules[rule.name] = existRule;
                        }
                    });
                }
                // 不存在
                else if (!isExist) {
                    the._ruleList.push(rule);
                    the._ruleNames[rule.name] = true;
                    the.rules[rule.name] = rule;

                    // 函数数组
                    rule.onbefores = [];
                    rule.onafters = [];
                    rule.functions = [];

                    pushFn(rule);
                }
            }
            // 存在不覆盖
            else if (isExist && !isOverride) {
                pushFn(the.rules[rule.name]);
            }

            return the;
        },


        /**
         * 执行所有数据验证
         * @param {Object} data 数据
         * @param {Function} callback 回调
         * @arguments  err 对象
         */
        validateAll: function (data, callback) {
            var the = this;
            var isBreakOnInvalid = the._options.isBreakOnInvalid;
            var errList = [];

            data = typeis(data) === 'object' ? data : {};
            callback = typeis(callback) === 'function' ? callback : noop;

            /**
             * 所有字段验证开始
             * @event validateallstart
             */
            the.emit('validateallstart');
            howdo.each(the._ruleList, function (key, rule, next) {
                the._validateOne(rule, data, function (err) {
                    if (!isBreakOnInvalid) {
                        errList.push(err);
                    }

                    if (!err || !isBreakOnInvalid) {
                        return next();
                    }

                    next(err);
                });
            }).follow(function (err) {
                var errs = null;

                if (isBreakOnInvalid) {
                    return callback.call(the, err, data);
                }

                dato.each(the._ruleList, function (index, rule) {
                    if (errList[index]) {
                        errs = errs || {};
                        errs[rule.name] = errList[index];
                    }
                });

                /**
                 * 所有字段验证结束
                 * @event validateallend
                 * @param errs {Array} 错误消息数组
                 * @param data {Object} 验证过滤后的数据
                 */
                the.emit('validateallend', errs, data);
                callback.call(the, errs, data);
            });
        },


        /**
         * 只对当前一个数据验证
         * @param {Object} data 数据
         * @param {Function} callback 回调
         * @arguments  err 对象
         */
        validateOne: function (data, callback) {
            var the = this;
            var findIndex = -1;
            var name = Object.keys(data)[0];

            callback = typeis(callback) === 'function' ? callback : noop;

            if (name) {
                /**
                 * 单个字段验证开始
                 * @event validateonestart
                 * @param name {String} 字段名称
                 */
                the.emit('validateonestart', name);
                dato.each(the._ruleList, function (index, rule) {
                    if (rule.name === name) {
                        findIndex = index;
                        return false;
                    }
                });

                if (findIndex > -1) {
                    the._validateOne(the._ruleList[findIndex], data, function (err, data) {
                        /**
                         * 单个字段验证结束
                         * @event validateoneend
                         * @param name {String} 字段名称
                         * @param error {Error} 错误消息
                         * @param value {*} 字段值
                         */
                        the.emit('validateoneend', name, err, data[name]);
                        callback.call(the, err, data[name], data);
                    });
                } else {
                    /**
                     * 单个字段验证结束
                     * @event validateoneend
                     * @param name {String} 字段名称
                     * @param error {Error} 错误消息
                     * @param value {*} 字段值
                     */
                    the.emit('validateoneend', name, null, data[name]);
                    callback.call(the, null, data[name], data);
                }
            } else {
                /**
                 * 单个字段验证开始
                 * @event validateonestart
                 * @param name {String} 字段名称
                 */
                the.emit('validateonestart', name);

                /**
                 * 单个字段验证结束
                 * @event validateoneend
                 * @param name {String} 字段名称
                 * @param error {Error} 错误消息
                 * @param value {*} 字段值
                 */
                the.emit('validateoneend', name, null, data[name]);
                callback.call(the, null, data[name], data);
            }
        },


        /**
         * 单个数据验证
         * @param rule
         * @param data
         * @param callback
         * @returns {*}
         * @private
         */
        _validateOne: function (rule, data, callback) {
            var the = this;
            var val = data[rule.name];
            var err;
            var type;
            var runCustom = function (next) {
                var runCustomRules = function (customRules) {
                    return function (callback) {
                        howdo.each(customRules, function (ruleName, ruleInfo, next) {
                            var _rule = rule[ruleName];

                            if (typeis(_rule) !== ruleInfo.type) {
                                return next();
                            }

                            ruleInfo.fn.call(rule, _rule, val, function (err) {
                                if (!err) {
                                    return next();
                                }

                                err = rule.msg[ruleName] ? new Error(rule.msg[ruleName]) : err;
                                next(err);
                            });
                        }).follow(callback);
                    };
                };

                howdo
                    // 静态自定义验证规则
                    .task(runCustomRules(customRules))
                    // 实例自定义验证规则
                    .task(runCustomRules(the._customRules))
                    // 异步串行
                    .follow(next);
            };
            var onover = function (err) {
                var hasBreak = false;

                // onafter
                if (!err) {
                    dato.each(rule.onafters, function (index, onafter) {
                        var ret = onafter.call(rule, val, data);

                        if (typeis.error(ret)) {
                            // callback
                            if (typeis.function(callback)) {
                                callback.call(the, ret, data);
                            }

                            hasBreak = true;
                            return false;
                        }

                        data[rule.name] = onafter.call(rule, ret, data);
                    });
                }

                if (hasBreak) {
                    return;
                }

                /**
                 * 单个字段验证结束
                 * @event validateend
                 * @param name {String} 字段名称
                 * @param data {Object} 验证过滤后的数据
                 */
                the.emit('validateend', rule.name, data);

                // callback
                if (typeis(callback) === 'function') {
                    callback.call(the, err, data);
                }
            };

            /**
             * 单个字段验证开始
             * @event validateend
             * @param name {String} 字段名称
             */
            the.emit('validatestart', rule.name);

            // onbefore
            rule.onbefores.forEach(function (fn) {
                data[rule.name] = val = fn.call(rule, val, data);
            });

            type = typeis(val);

            // trim
            if (type === 'string' && rule.trim) {
                data[rule.name] = val = String(val).trim();
            }

            // exist
            var info = _getDataInfo(val);

            // 是否存在
            var isExist = !!info.stringLength || !!info.number || !!info.booleanLength;

            // 需要验证 = 存在就验证 && 存在 || 一直验证
            var require2Exist2Validate = rule.exist && isExist || !rule.exist;

            if (require2Exist2Validate) {
                // required
                if (rule.required && type === 'string') {
                    err = new Error(rule.msg.required || rule.alias + '不能为空');

                    if (!info.stringLength) {
                        return onover(err);
                    }
                }

                // type
                err = new Error(rule.msg.type || rule.alias + '数据类型必须为' + rule.type);

                switch (rule.type) {
                    case 'string':
                    case 'email':
                    case 'url':
                        if (type !== 'string') {
                            return onover(err);
                        }

                        if (rule.type === 'email' && !typeis.email(val)) {
                            return onover(err);
                        }

                        if (rule.type === 'url' && !typeis.url(val)) {
                            return onover(err);
                        }
                        break;

                    default:
                        if (rule.type && type !== rule.type) {
                            return onover(err);
                        }
                }

                // length
                if (typeis.number(rule.length) && type === 'string') {
                    err = new Error(rule.msg.length || rule.alias + '长度必须为' + rule.length + '字符');

                    if (info.stringLength !== rule.length) {
                        return onover(err);
                    }
                }

                // bytes
                if (typeis.number(rule.bytes) && type === 'string') {
                    err = new Error(rule.msg.bytes || rule.alias + '长度必须为' + rule.bytes + '字节');

                    if (info.stringBytes !== rule.bytes) {
                        return onover(err);
                    }
                }

                // minLength
                if (typeis.number(rule.minLength) && type === 'string') {
                    err = new Error(rule.msg.minLength || rule.alias + '长度不能少于' + rule.minLength + '字符');

                    if (info.stringLength < rule.minLength) {
                        return onover(err);
                    }
                }

                // minBytes
                if (typeis.number(rule.minBytes) && type === 'string') {
                    err = new Error(rule.msg.minBytes || rule.alias + '长度不能少于' + rule.minBytes + '字节');

                    if (info.stringBytes < rule.minBytes) {
                        return onover(err);
                    }
                }

                // maxLength
                if (typeis.number(rule.maxLength) && type === 'string') {
                    err = new Error(rule.msg.maxLength || rule.alias + '长度不能超过' + rule.maxLength + '字符');

                    if (info.stringLength > rule.maxLength) {
                        return onover(err);
                    }
                }

                // maxBytes
                if (typeis.number(rule.maxBytes) && type === 'string') {
                    err = new Error(rule.msg.maxBytes || rule.alias + '长度不能超过' + rule.maxBytes + '字节');

                    if (info.stringBytes > rule.maxBytes) {
                        return onover(err);
                    }
                }

                // inArray
                if (typeis.array(rule.inArray)) {
                    err = new Error(rule.msg.inArray || rule.alias + '必须是“' + rule.inArray.join('、') + '”其一');
                    if (rule.inArray.indexOf(val) === -1) {
                        return onover(err);
                    }
                }

                // min
                if (typeis.number(rule.min) && type === 'number') {
                    err = new Error(rule.msg.min || rule.alias + '不能小于' + rule.min);
                    if (val < rule.min) {
                        return onover(err);
                    }
                }

                // max
                if (typeis.number(rule.max) && type === 'number') {
                    err = new Error(rule.msg.max || rule.alias + '不能大于' + rule.max);

                    if (val > rule.max) {
                        return onover(err);
                    }
                }

                // regexp
                if (typeis.regexp(rule.regexp) && type === 'string') {
                    err = new Error(rule.msg.regexp || rule.alias + '不符合规则');

                    if (!rule.regexp.test(val)) {
                        return onover(err);
                    }
                }

                // equal
                if (rule.equal !== undefined) {
                    var msg = '';

                    switch (typeis(rule.equal)) {
                        case 'string':
                        case 'email':
                        case 'url':
                            msg = rule.equal + '';
                            break;

                        case 'boolean':
                            msg = rule.equal ? '真' : '假';
                            break;

                        case 'number':
                            msg = '数值' + rule.equal;
                            break;
                    }

                    err = new Error(rule.msg.equal || rule.alias + '必须是' + rule.equal);

                    if (!_isEqual(val, rule.equal)) {
                        return onover(err);
                    }
                }

                runCustom(function (err) {
                    if (err) {
                        return onover(err);
                    }

                    // function
                    howdo.each(rule.functions, function (index, fn, next) {
                        var fnLen = fn.length;

                        if (fnLen === 3) {
                            fn.call(window, val, data, next);
                        } else if (fnLen === 2) {
                            fn.call(window, val, next);
                        } else {
                            next();
                        }
                    }).follow(onover);
                });
            } else {
                onover();
            }
        }
    });


    /**
     * 注册自定义的静态验证规则
     * @param options {Object} 规则配置
     * @param fn {Function} 规则方法
     * @param [isOverride=false] 是否覆盖已有规则
     *
     * @example
     * // 添加一个检查后缀的自定义规则
     * Validator.registerRule({
     *     name: 'suffix',
     *     type: 'array'
     * }, function(suffix, val, next){
     *     var sf = (val.match(/\.[^.]*$/) || [''])[0];
     *     var boolean = suffix.indexOf(sf) > -1;
     *
     *     next(boolean ? null : new Error(this.alias + '的文件后缀不正确'), val);
     * });
     */
    Validator.registerRule = function (options, fn, isOverride) {
        if (!customRules[options.name] || customRules[options.name] && isOverride) {
            customRules[options.name] = {
                name: options.name,
                type: options.type,
                fn: fn
            };
        }
    };

    module.exports = Validator;


    /**
     * 获取数据信息
     * @param {*} data
     * @returns {Object}
     * @private
     */
    function _getDataInfo(data) {
        var type = typeis(data);
        var ret = {};

        switch (type) {
            case 'string':
                ret.stringLength = data.length;
                ret.stringBytes = string.bytes(data);
                break;

            case 'number':
                ret.number = data;
                break;

            case 'boolean':
                ret.booleanLength = 1;
                break;
        }

        return ret;

    }


    /**
     * 判断两个数据是否相等
     * @param data
     * @param equal
     * @returns {Boolean}
     * @private
     */
    function _isEqual(data, equal) {
        var type = typeis(data);
        var compare;

        switch (type) {
            case 'string':
            case 'number':
                return data === equal;

            case 'array':
            case 'object':
                compare = dato.compare(data, equal);
                return compare ? !compare.diff.length : false;

            case 'boolean':
                return data === equal;
        }
    }
});