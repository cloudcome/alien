/*!
 * 文件描述
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
    var event = require('../../core/event/base.js');
    var dato = require('../../util/dato.js');
    var Vldor = require('../../libs/Validator.js');
    var alienIndex = 0;
    var alienClass = 'alien-ui-validator';
    var udf;
    var inputSelector = 'input,select,textarea';
    var defaults = {
        dataRuleAttr: 'validator',
        dataMessageAttr: 'msg',
        formItemSelector: '.form-item',
        formMsgSelector: '.form-msg',
        isVisibleOnSuccess: false,
        isBreakOnInvalid: false,
        triggerEvent: 'focusout',
        successMsg: '填写正确'
    };
    var Validator = ui.create({
        constructor: function ($form, options) {
            var the = this;

            the._$form = selector.query($form)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },

        _init: function () {
            var the = this;

            the._initRule();
            the._initEvent();

            return the;
        },


        _initRule: function () {
            var the = this;
            var options = the._options;
            var $inputs = selector.query(inputSelector, the._$form);
            var typeArray = ['url', 'email', 'number', 'string'];

            the._validator = new Vldor();
            the._nameItemMap = {};
            the._nameMsgMap = {};
            dato.each($inputs, function (index, $input) {
                var $formItem = selector.closest($input, options.formItemSelector)[0];
                var $formMsg = selector.query(options.formMsgSelector, $formItem)[0];
                var name = $input.name;
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
                    regexp: $input.pattern,
                    required: $input.required,
                    type: typeArray.indexOf(type) > -1 ? type : 'string'
                };

                // 验证前置
                rule.onbefore = function (val, data) {
                    if (this.equalName) {
                        this.equal = data[this.equalName];
                    }

                    return val;
                };

                dato.extend(true, rule, standar);
                the._validator.pushRule(rule);
                the._nameItemMap[name] = $formItem;
                the._nameMsgMap[name] = $formMsg;
            });
        },


        _initEvent: function () {
            var the = this;
            var options = the._options;

            if (options.triggerEvent) {
                event.on(the._$form, options.triggerEvent, inputSelector, function () {
                    var data = {};
                    var name = this.name;

                    data[name] = this.value;
                    the._validator.validateOne(data, function (err, val) {
                        if (err) {
                            return the.emitMsg(name, err.message);
                        }

                        the.emitMsg(name, options.successMsg, 'success');
                    });
                });
            }
        },


        /**
         * 触发表单消息
         * @param name
         * @param message
         * @param [type="error"]
         */
        emitMsg: function (name, message, type) {
            type = type || 'error';

            var the = this;
            var $formItem = the._nameItemMap[name];
            var $formMsg = the._nameMsgMap[name];

            if ($formMsg) {
                $formMsg.innerHTML = message;
            }

            attribute.addClass($formItem, 'has' + type);

            return the;
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
     */
    module.exports = Validator;
});