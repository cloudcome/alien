/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-02 14:20
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/touch.js');
    var Validation = require('../../libs/validation.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var string = require('../../utils/string.js');
    var ui = require('../');
    // {
    //     minLength: function(ruleValue){
    //         retrun function(value, done){
    //              done(value.length >= ruleValue * 1 ? null : '${path}长度必须大于${0}');
    //         };
    //     };
    // }
    var validationMap = {};
    var tagNameMap = {
        textarea: 1,
        select: 1
    };
    var html5Rules = ['required', 'min', 'max', 'step'];
    var REG_LABEL = /^([^:：]*)/;
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        isBreakOnInvalid: typeis.window(window) ? false : true,
        defaultMsg: '${path}字段不合法',
        // 规则的 data 属性
        dataAttribute: 'validation',
        // data 规则分隔符
        dataSep: ',',
        // data 规则等于符
        dataEqual: ':',
        // 验证的表单项目选择器
        itemSelector: 'input,select,textarea',
        // 提交按钮
        submitSelector: '.form-submit',
        // 验证事件
        event: 'focusout change'
    };
    //var typeRegExpMap = {
    //    number: /^\d+$/,
    //    url: ''
    //};
    var ValidationUI = ui.create({
        constructor: function ($form, options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the._$form = selector.query($form)[0];
            the.update();
            the._initEvent();
        },


        /**
         * 更新验证规则
         * @returns {ValidationUI}
         */
        update: function () {
            var the = this;

            the._$submit = selector.query(the._options.submitSelector, the._$form)[0];

            //if (!the._$submit) {
            //    the._$submit = modification.create('button', {
            //        type: 'submit',
            //        style: {
            //            display: 'none'
            //        }
            //    });
            //    modification.insert(the._$submit, the._$form);
            //}

            the._validation = new Validation(the._options);
            the._validation.pipe(the);
            the._parseItems();

            return the;
        },


        /**
         * 触发提交表单
         * @returns {ValidationUI}
         */
        submit: function () {
            var the = this;

            if (!the._$submit) {
                throw 'submit button is not found';
            }

            event.dispatch(the._$submit, 'click');

            return the;
        },


        /**
         * 获取表单数据
         * @returns {{}}
         */
        getData: function () {
            var the = this;
            var data = {};

            dato.each(the._$items, function (i, $item) {
                var path = $item.name;
                var type = the._getType($item);
                var val = $item.value;
                var isMultiple = $item.multiple;

                switch (type) {
                    case 'checkbox':
                        data[path] = data[path] || [];

                        if ($item.checked && val) {
                            data[path].push(val);
                        }

                        break;

                    case 'select':
                        if (isMultiple) {
                            data[path] = [];
                        }

                        dato.repeat($item.length, function (index) {
                            var $option = $item[index];
                            var val = attribute.attr($option, 'value');

                            if ($option.selected && val) {
                                if (isMultiple) {
                                    data[path].push(val);
                                } else {
                                    data[path] = val;
                                    return false;
                                }
                            }
                        });

                        break;

                    case 'radio':
                        if ($item.checked) {
                            data[path] = val;
                        }

                        break;

                    case 'file':
                        var files = $item.files;

                        if (isMultiple) {
                            data[path] = files.length ? files : [];
                        } else {
                            data[path] = files.length ? files[0] : null;
                        }

                        break;

                    default :
                        data[path] = val;
                }
            });

            return data;
        },


        /**
         * 注册验证规则，按顺序执行验证
         * @param path {String} 字段
         * @param rule {String|Array|RegExp|Function} 验证规则，可以是静态规则，也可以添加规则
         * @param [msg] {String} 验证失败消息
         * @returns {ValidationUI}
         */
        addRule: function (path, rule, msg) {
            var the = this;

            the._validation.addRule.apply(the._validation, arguments);

            return the;
        },


        /**
         * 获取元素类型
         * @param $item
         * @returns {String}
         * @private
         */
        _getType: function ($item) {
            var tagName = $item.tagName.toLowerCase();

            return tagNameMap[tagName] ? tagName : $item.type;
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;

            event.on(the._$form, 'click', options.submitSelector, the._onsubmit = function () {
                var data = the.getData();

                the._validation.validateAll(data);
            });
        },


        /**
         * 解析表单项目
         * @private
         */
        _parseItems: function () {
            var the = this;
            var options = the._options;
            var parseName = {};

            the._items = [];
            the._$items = selector.query(options.itemSelector, the._$form);
            dato.each(the._$items, function (i, $item) {
                var name = $item.name;

                if (!parseName[name]) {
                    parseName[name] = 1;
                    the._parseRules($item);
                }
            });
        },


        /**
         * 解析项目规则
         * @param $item {Object}
         * @private
         */
        _parseRules: function ($item) {
            var the = this;
            var options = the._options;
            var id = $item.id;
            var path = $item.name;
            var type = the._getType($item);
            var validationStr = attribute.data($item, options.dataAttribute);
            var validationList = the._parseValidation(validationStr);

            // 规则顺序
            // required => type => minLength => maxLength => pattern => data

            if ($item.required) {
                the._validation.addRule(path, the._getRule('required'));
            }

            if ($item.min !== '' && !typeis.empty($item.min)) {
                the._validation.addRule(path, the._getRule('min', $item.min));
            }

            if ($item.max !== '' && !typeis.empty($item.max)) {
                the._validation.addRule(path, the._getRule('max', $item.max));
            }

            if ($item.accept !== '' && !typeis.empty($item.accept)) {
                the._validation.addRule(path, the._getRule('accept', $item.accept));
            }

            // @todo step
            //if (!typeis.undefined($item.step)) {
            //    var step = $item.step;
            //
            //    if(typeis.undefined($item.min)){
            //        throw 'the `min` attribute of element is not found';
            //    }
            //
            //    //the._validation.addRule(path, the._getRule('step', $item.step));
            //}

            switch (type) {
                case 'number':
                case 'email':
                case 'url':
                    the._validation.addRule(path, type);
                    break;
            }

            var hasAlias = false;

            validationList.forEach(function (validation) {
                var validationName = validation.name;
                var validationVal = validation.value;

                if (validationName === 'alias') {
                    the._validation.setAlias(path, validationVal);
                    hasAlias = true;
                    return;
                }

                if (validationName === 'type') {
                    the._validation.addRule(path, validationVal);
                    return;
                }

                var rule;

                if ((rule = the._getRule(validationName, validationVal))) {
                    return the._validation.addRule(path, rule);
                }

                throw '`' + validationName + '` is not found';
            });

            if (!hasAlias) {
                var $label = selector.query('label[for="' + id + '"]', the._$form)[0];

                if ($label) {
                    the._validation.setAlias(path, (attribute.text($label).match(REG_LABEL) || ['', ''])[1].trim());
                }
            }
        },


        /**
         * 获取验证规则
         * @param ruleName
         * @param validationVal
         * @returns {*}
         * @private
         */
        _getRule: function (ruleName, validationVal) {
            var rule;

            // 1. 当前静态规则
            if ((rule = validationMap[ruleName])) {
                return rule.call(this, validationVal);
            }

            // 2. 库的静态规则
            if ((rule = Validation.getRule(ruleName))) {
                return rule;
            }
        },


        /**
         * 解析 data 验证规则
         * @param ruleString
         * @returns {Array}
         * @private
         */
        _parseValidation: function (ruleString) {
            var the = this;
            var options = the._options;

            if (!ruleString) {
                return [];
            }

            var list1 = ruleString.split(options.dataSep);
            var list2 = [];

            list1.forEach(function (item) {
                var temp = item.split(options.dataEqual);

                list2.push({
                    name: temp[0].trim(),
                    value: temp[1] ? temp[1].trim() : true
                });
            });

            return list2;
        }
    });

    /**
     * 添加静态的 ui 验证规则
     * @param ruleName {String} 规则名称
     * @param fn {Function} 返回包含生成规则的方法的高阶方法
     */
    ValidationUI.addRule = function (ruleName, fn) {
        if (validationMap[ruleName] && DEBUG) {
            console.warn('override rule of ' + ruleName);
        }

        validationMap[ruleName] = fn;
    };

    dato.each(require('./rules.js'), ValidationUI.addRule);
    ValidationUI.defaults = defaults;
    module.exports = ValidationUI;
});