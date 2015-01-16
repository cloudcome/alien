/*!
 * 表单验证
 * @author ydr.me
 * @create 2015-01-16 13:51
 */


define(function (require, exports, module) {
    /**
     * @module ui/Validator/
     */
    'use strict';

    var ui = require('../base.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var Vldor = require('../../libs/Validator.js');
    var alienIndex = 0;
    var alienClass = 'alien-ui-validator';
    var udf;
    var inputSelector = 'input,select,textarea';
    var formItemStatusClass = 'has-error has-success';
    var noop = function () {
        // ignore
    };
    var customRulesList = [];
    var defaults = {
        dataRuleAttr: 'validator',
        dataMessageAttr: 'msg',
        formItemSelector: '.form-item',
        formMsgSelector: '.form-msg',
        isBreakOnInvalid: false,
        validateEvent: 'focusout',
        successMsg: '填写正确'
    };
    var Validator = ui.create({
        STATIC: {
            /**
             * 注册自定义的静态验证规则
             * @param options {Object} 规则配置
             * @param rule {Function} 规则方法
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
            registerRule: function (options, fn, isOverride) {
                customRulesList.push(arguments);
            }
        },
        /**
         * 构造函数
         * @param $form
         * @param options
         */
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
            the._initRule();
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
         * 初始化验证规则
         * @private
         */
        _initRule: function () {
            var the = this;
            var options = the._options;
            var $inputs = selector.query(inputSelector, the._$form);
            var typeArray = ['url', 'email', 'number', 'string'];

            attribute.addClass(the._$form, alienClass);
            the._validator = new Vldor();
            the._nameItemMap = {};
            the._nameMsgMap = {};
            the._nameInputMap = {};
            dato.each($inputs, function (index, $input) {
                var name = $input.name;

                if (!name) {
                    return;
                }

                var id = $input.id;
                var $label = id ? selector.query('label[for=' + id + ']')[0] : selector.closest($input, 'label')[0];
                var $formItem = selector.closest($input, options.formItemSelector)[0];
                var $formMsg = selector.query(options.formMsgSelector, $formItem)[0];
                var rule = attribute.data($input, options.dataRuleAttr);
                var msg = attribute.data($input, options.dataMessageAttr);
                var type = attribute.attr($input, 'type');
                var standar = {
                    name: name,
                    msg: msg,
                    maxLength: $input.maxLength,
                    min: dato.parseInt($input.min, udf),
                    max: dato.parseInt($input.max, udf),
                    step: dato.parseInt($input.step, udf),
                    required: $input.required,
                    type: typeArray.indexOf(type) > -1 ? type : 'string'
                };

                if ($input.pattern) {
                    try {
                        standar.regexp = new RegExp($input.pattern);
                    } catch (err) {
                        // ignore
                    }
                }

                // 验证前置
                rule.onbefore = function (val, data) {
                    if (this.equalName) {
                        this.equal = data[this.equalName];
                    }

                    return val;
                };

                dato.extend(true, rule, standar);
                rule.alias = rule.alias || ($label ? $label.innerText : udf);
                the._validator.pushRule(rule);
                the._nameItemMap[name] = $formItem;
                the._nameMsgMap[name] = $formMsg;
                the._nameInputMap[name] = $input;
            });
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;

            if (options.validateEvent) {
                event.on(the._$form, options.validateEvent, inputSelector, the._onvalidate.bind(the));
            }

            event.on(the._$form, 'tap click', 'input[type=submit],button', the._onsubmit.bind(the));
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
         * 触发表单消息
         * @param name {String} 需要验证的表单 name
         * @param message {String} 消息
         * @param [isSuccess=false] 是否为成功消息
         */
        emitMsg: function (name, message, isSuccess) {
            var the = this;
            var $formItem = the._nameItemMap[name];
            var $formMsg = the._nameMsgMap[name];

            if ($formMsg) {
                $formMsg.innerHTML = message;
            }

            attribute.removeClass($formItem, formItemStatusClass);
            attribute.addClass($formItem, 'has-' + (isSuccess ? 'success' : 'error'));

            if (the._options.successMsg === null) {
                attribute.state($formMsg, isSuccess ? 'hide' : 'show');
            } else {
                attribute.state($formMsg, 'show');
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
            the.emit('validateonebefore', $input);
            the._validator.validateOne(data, function (err) {
                the.emit('validateoneafter', $input);
                the.emitMsg(name, err ? err.message : the._options.successMsg, !err);
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

            the.emit('validateallbefore', the._$form);
            the._validator.validateAll(data, function (errs) {
                callback.apply(this, arguments);
                the.emit('validateallafter', the._$form, errs);

                if (!errs) {
                    return;
                }

                dato.each(the._nameInputMap, function (name) {
                    if (errs[name]) {
                        the.emitMsg(name, errs[name].message);
                    } else {
                        the.emitMsg(name, the._options.successMsg, true);
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

            dato.each(the._nameItemMap, function (name, $formItem) {
                attribute.removeClass($formItem, formItemStatusClass);
            });
            event.un(the._$form, the._options.validateEvent, the._onvalidate);
            event.un(the._$form, 'tap click', the._onsubmit);
            attribute.removeClass(the._$form, alienClass);
        }
    });


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
     * @param [options.successMsg="填写正确"] {String|null} 正确消息，如果为 null，则在正确时隐藏
     */
    module.exports = Validator;
    customRulesList.push([{
        name: 'suffix',
        type: 'array'
    }, function (suffix, val, next) {
        var sf = (val.match(/\.[^.]*$/) || [''])[0];
        var boolean = suffix.indexOf(sf) > -1;

        next(boolean ? null : new Error(this.alias + '的后缀不正确'), val);
    }]);
});