/*!
 * 表单验证【废弃】
 * @author ydr.me
 * @create 2015-01-16 13:51
 */


define(function (require, exports, module) {
    /**
     * @module ui/validator/
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/event/touch
     * @requires utils/typeis
     * @requires utils/dato
     * @requires utils/number
     * @requires utils/string
     * @requires libs/validator
     */
    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var style = require('./style.css', 'css');
    var event = require('../../core/event/touch.js');
    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var number = require('../../utils/number.js');
    var string = require('../../utils/string.js');
    var Vldor = require('../../libs/validator.js');
    var alienIndex = 0;
    var alienClass = 'alien-ui-validator';
    var udf;
    var inputSelector = 'input,select,textarea';
    var formItemStatusClass = 'has-error has-success has-warning';
    var noop = function () {
        // ignore
    };
    var customRulesList = [];
    var REG_END_MAO = /[:：]+$/;
    var defaults = {
        dataRuleAttr: 'validator',
        dataMessageAttr: 'msg',
        formItemSelector: '.form-item',
        formMsgSelector: '.form-msg',
        isBreakOnInvalid: false,
        validateEvent: 'focusout',
        successMsg: null,
        canAddStatusClass: true
    };
    var Validator = ui.create({
        constructor: function ($form, options) {
            var the = this;

            the._$form = selector.query($form)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },
        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the.id = alienIndex++;
            the.updateRule();
            the._initCustomRules();
            the._initEvent();

            return the;
        },


        /**
         * 添加自定义规则
         * 添加到实例上，避免污染
         * @private
         */
        _initCustomRules: function () {
            var the = this;

            dato.each(customRulesList, function (index, args) {
                the._validator.registerRule.apply(the._validator, args);
            });
        },


        /**
         * 更新验证规则，当表单发生变化时可以手动触发
         */
        updateRule: function () {
            var the = this;
            var options = the._options;
            var $inputs = selector.query(inputSelector, the._$form);
            var typeArray = ['url', 'email', 'number', 'string'];

            attribute.addClass(the._$form, alienClass);
            the._validator = new Vldor();
            the._nameItemMap = {};
            the._nameMsgMap = {};
            the._nameInputMap = {};
            the._nameRuleMap = {};
            dato.each($inputs, function (index, $input) {
                var name = $input.name;

                if (!name) {
                    return;
                }

                var id = $input.id;
                var $label = id ? selector.query('label[for=' + id + ']')[0] : selector.closest($input, 'label')[0];
                var $formItem = selector.closest($input, options.formItemSelector)[0];
                var $formMsg = selector.query(options.formMsgSelector, $formItem)[0];
                var rule = attribute.data($input, options.dataRuleAttr) || {};
                var msg = attribute.data($input, options.dataMessageAttr);
                var type = attribute.attr($input, 'type');
                var standar = {
                    name: name,
                    msg: msg,
                    maxLength: $input.maxLength === -1 ? Math.pow(2, 53) : $input.maxLength,
                    min: number.parseInt($input.min, udf),
                    max: number.parseInt($input.max, udf),
                    step: number.parseInt($input.step, udf),
                    required: $input.required,
                    type: typeArray.indexOf(type) > -1 ? type : 'string'
                };

                if ($formMsg) {
                    attribute.data($formMsg, 'original', $formMsg.innerHTML);
                }

                // regexp
                if ($input.pattern) {
                    try {
                        standar.regexp = new RegExp($input.pattern);
                    } catch (err) {
                        // ignore
                    }
                }

                // 验证前置
                rule.onbefore = function (val, data) {
                    var self = this;

                    if (self.equalName) {
                        var equalRule = the._nameRuleMap[self.equalName];

                        self.equal = the._getVal(self.equalName);
                        self.msg.equal = self.msg.equal || self.alias +
                        (equalRule ? '必须与' + equalRule.alias + '相同' : '不正确');
                    }

                    return val;
                };

                dato.extend(true, rule, standar);
                rule.alias = rule.alias || ($label ? $label.innerText.trim().replace(REG_END_MAO, '') : udf);
                the._validator.pushRule(rule);
                the._nameItemMap[name] = $formItem;
                the._nameMsgMap[name] = $formMsg;
                the._nameInputMap[name] = $input;
                the._nameRuleMap[name] = rule;
            });

            return the;
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;

            event.on(the._$form, 'focus', inputSelector, the._onfocus.bind(the));

            if (options.validateEvent) {
                event.on(the._$form, options.validateEvent, inputSelector, the._onvalidate.bind(the));
            }

            event.on(the._$form, 'click', 'input[type=submit],button', the._onsubmit.bind(the));

            the._validator.on('validatestart', function (name) {
                var $item = the._nameItemMap[name];

                attribute.removeClass($item, formItemStatusClass);

                if (options.canAddStatusClass) {
                    attribute.addClass($item, 'has-warning');
                }

                the.emit(this.alienEmitter.type, the._nameInputMap[name]);
            });

            the._validator.on('validateend', function (name, data) {
                the.emit(this.alienEmitter.type, the._nameInputMap[name], data);
            });

            the._validator.on('validateonestart', function (name) {
                the.emit(this.alienEmitter.type, the._nameItemMap[name]);
            });

            the._validator.on('validateoneend', function (name, err) {
                the.emit(this.alienEmitter.type, the._nameItemMap[name], err);
            });

            the._validator.on('validateallstart', function () {
                dato.each(the._nameItemMap, function (name, $item) {
                    attribute.removeClass($item, formItemStatusClass);
                });

                the.emit(this.alienEmitter.type, the._$form);
            });

            the._validator.on('validateallend', function (errs) {
                the.emit(this.alienEmitter.type, the._$form, errs);
            });
        },


        /**
         * 聚焦时回调
         * @param eve
         * @private
         */
        _onfocus: function (eve) {
            var the = this;
            var $input = eve.target;

            the.emitMsg($input.name, false);
            the.emit('focus', $input);
        },


        /**
         * 正在验证
         * @param eve
         * @private
         */
        _onvalidate: function (eve) {
            var the = this;
            var $input = eve.target;
            var name = $input.name;

            the.validateOne(name);
        },


        /**
         * 提交验证
         * @param eve
         * @private
         */
        _onsubmit: function (eve) {
            var $ele = eve.target;
            var $btn = selector.closest($ele, 'button')[0] || $ele;

            if ($btn.type !== 'submit' || $btn.disabled || attribute.hasClass($btn, 'disabled')) {
                return;
            }

            this.validateAll();
            eve.preventDefault();
        },


        /**
         * 获取输入框的值
         * @param name
         * @private
         */
        _getVal: function (name) {
            var $input = this._nameInputMap[name];

            if (!$input) {
                return udf;
            }

            var type = $input.type;
            var multiple = $input.multiple;
            var tagName = $input.tagName.toLowerCase();
            var val;

            type = tagName === 'select' || tagName === 'textarea' ? tagName : type;

            switch (type) {
                case 'checkbox':
                    val = [];
                    dato.each(selector.query('input[name=' + name + '][type=checkbox]:checked'), function (index, $checkbox) {
                        val.push($checkbox.value);
                    });
                    break;

                case 'radio':
                    $input = selector.query('input[name=' + name + '][type=radio]:checked')[0];
                    val = $input ? $input.value : udf;
                    break;

                case 'select':
                    if (multiple) {
                        val = [];
                        dato.each(selector.query('select[name=' + name + '] > option:selected'), function (index, $option) {
                            val.push($option.value);
                        });
                    } else {
                        $input = selector.query('select[name=' + name + ']')[0];
                        val = $input ? $input.value : udf;
                    }
                    break;

                default:
                    val = $input.value;
            }

            return val;
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

            the._validator.pushRule(rule, isOverride);

            return the;
        },


        /**
         * 触发表单消息
         * @param name {String} 需要验证的表单 name
         * @param message {String|undefined|false} 消息
         * @param type {String} 消息类型
         */
        emitMsg: function (name, message, type) {
            var the = this;
            var $formItem = the._nameItemMap[name];
            var $formMsg = the._nameMsgMap[name];

            if ($formMsg) {
                $formMsg.innerHTML = message === false ? attribute.data($formMsg, 'original') : message;
            }

            attribute.removeClass($formItem, formItemStatusClass);

            if (type && the._options.canAddStatusClass) {
                attribute.addClass($formItem, 'has-' + type);
            }

            return the;
        },


        /**
         * 单个验证
         * @param name {String} 需要验证的表单 name
         * @param [callback] {Function} 回调
         */
        validateOne: function (name, callback) {
            var the = this;
            var data = {};
            var $input = the._nameInputMap[name];

            callback = typeis.function(callback) ? callback : noop;
            data[name] = the._getVal(name);
            the._validator.validateOne(data, function (err) {
                the.emitMsg(name, err ? err.message : this.rules[name].msg.success || the._options.successMsg, err ? 'error' : 'success');
                callback.apply(this, arguments);
            });

            return the;
        },


        /**
         * 全部验证
         * @param [callback] {Function} 回调
         */
        validateAll: function (callback) {
            var the = this;
            var data = {};

            callback = typeis.function(callback) ? callback : noop;

            dato.each(the._nameInputMap, function (name) {
                data[name] = the._getVal(name);
            });
            the._validator.validateAll(data, function (errs) {
                var self = this;

                callback.apply(self, arguments);

                dato.each(the._nameInputMap, function (name) {
                    if (errs && errs[name]) {
                        the.emitMsg(name, errs[name].message, 'error');
                    } else {
                        the.emitMsg(name, self.rules[name].msg.success || the._options.successMsg, 'success');
                    }
                });
            });

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            attribute.removeClass(the._nameItemMap, formItemStatusClass);
            event.un(the._$form, 'focus', the._onfocus);
            event.un(the._$form, the._options.validateEvent, the._onvalidate);
            event.un(the._$form, 'click', the._onsubmit);
            attribute.removeClass(the._$form, alienClass);
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
        customRulesList.push(arguments);
    };


    /**
     * 表单验证
     * 推荐的表单结构为：
     * ```
     * ul.m-form>(li.form-item>div.form-msg)*n
     * ```
     * 表单的验证规则：
     * ```
     * input data-validator="{required: true, maxLength: 5}" maxlength="6"
     * ```
     * 以标准属性规则为准，以上的验证规则为
     * ```
     * {
     *     required: true,
     *     maxlength: 6
     * }
     * ```
     *
     * @param $form {Node|String} form 节点
     * @param [options] {Object} 配置
     * @param [options.dataRuleAttr="validator"] {String} 存放验证规则的 data-attribute 名称
     * @param [options.dataMessageAttr="msg"] {String} 存放验证消息的 data-attribute 名称
     * @param [options.formItemSelector=".form-item"] {String} 表单项选择器
     * @param [options.formMsgSelector=".form-msg"] {String} 表单消息选择器
     * @param [options.isBreakOnInvalid=false] {Boolean} 是否在错误时就停止后续验证
     * @param [options.validateEvent="focusout"] {String} 触发表单验证事件类型
     * @param [options.successMsg=null] {String|null} 正确消息，如果为 null，则在正确时隐藏
     * @param [options.canAddStatusClass=null] {Boolean} 是否可以添加验证状态的 className
     */
    module.exports = Validator;
    ui.importStyle(style);

    Validator.registerRule({
        name: 'suffix',
        type: 'array'
    }, function (suffix, val, next) {
        var sf = (val.match(/\.[^.]*$/) || [''])[0];
        var reg = new RegExp('(' + suffix.map(function (sf) {
            return string.escapeRegExp(sf);
        }).join('|') + ')$', 'i');

        next(reg.test(sf) ? null : new Error(this.alias + '的后缀必须为“' +
        suffix.join('/') + '”' +
        (suffix.length > 1 ? '之一' : '')), val);
    });
});