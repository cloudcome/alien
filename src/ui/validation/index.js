/*!
 * 表单
 * @author ydr.me
 * @create 2015-07-02 14:20
 */


define(function (require, exports, module) {
    /**
     * @module ui/validation/
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/event/touch
     * @requires libs/validation
     * @requires libs/validation-rules
     * @requires ui/validation/validation-rules
     * @requires libs/emitter
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/string
     * @requires ui/
     */

    'use strict';

    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/touch.js');
    var Validation = require('../../libs/validation.js');
    require('../../libs/validation-rules.js')(Validation);
    require('./validation-rules.js')(Validation);
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
    var REG_ALIAS = /^([^:：]*)/;
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        breakOnInvalid: typeis.window(window) ? false : true,
        defaultMsg: '${path}字段不合法',
        // 规则的 data 属性
        dataValidation: 'validation',
        dataAlias: 'alias',
        // data 规则分隔符
        dataSep: ',',
        // data 规则等于符
        dataEqual: ':',
        // 验证的表单项目选择器
        inputSelector: 'input,select,textarea'
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
            the._pathMap = {};
            the.destroyed = false;
            the.update();
        },


        /**
         * 更新验证规则
         * @returns {ValidationUI}
         */
        update: function () {
            var the = this;

            the._validation = new Validation(the._options);
            the._validation
                .on('valid', function (path) {
                    the.emit('valid', the._pathMap[path]);
                })
                .on('invalid', function (err, path) {
                    the.emit('invalid', err, the._pathMap[path]);
                })
                .on('error', function (path) {
                    the.emit('error', the._pathMap[path]);
                })
                .on('success', function () {
                    the.emit('success');
                })
                .before('validate', function (path) {
                    the.emit('beforevalidate', the._pathMap[path]);
                })
                .after('validate', function (path) {
                    the.emit('aftervalidate', the._pathMap[path]);
                });
            the._parseItems();

            return the;
        },


        /**
         * 获取表单数据
         * @param [$input] {Object} 指定元素
         * @returns {{}}
         */
        getData: function ($input) {
            var the = this;
            var data = {};
            var list = $input ? [] : the._$inputs;

            if ($input) {
                var inputType = the._getType($input);

                switch (inputType) {
                    case 'checkbox':
                    case 'radio':
                        list = selector.query('input[name="' + $input.name + '"]', the._$form);
                        break;

                    default :
                        list = [$input];
                }
            }

            dato.each(list, function (i, $item) {
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
                        } else {
                            data[path] = '';
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
         * @param nameOrfn {String|Function} 验证规则，可以是静态规则，也可以添加规则
         * @returns {ValidationUI}
         */
        addRule: function (path, nameOrfn/*arguments*/) {
            var the = this;

            the._validation.addRule.apply(the._validation, arguments);

            return the;
        },


        /**
         * 单独验证某个输入对象
         * @param [$ele] {Object} 输入对象，如果为空则验证全部
         * @param [callback] {Function} 回调
         * @returns {ValidationUI}
         */
        validate: function ($ele, callback) {
            var the = this;
            var data = the.getData($ele);

            if ($ele) {
                the._validation.validateOne(data, callback);
            } else {
                the._validation.validateAll(data, callback);
            }

            return the;
        },


        ///**
        // * 获取字段的表单类型
        // * @param path {String} 表单
        // * @returns {String}
        // */
        //getType: function (path) {
        //    var the = this;
        //    var $ele = the._pathMap[path];
        //
        //    return $ele ? the._getType($ele) : 'unknow';
        //},


        /**
         * 销毁实例
         */
        destroy: function () {
            //
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
         * 解析表单项目
         * @private
         */
        _parseItems: function () {
            var the = this;
            var options = the._options;

            the._items = [];
            the._$inputs = selector.query(options.inputSelector, the._$form);
            the._$inputs = selector.filter(the._$inputs, function () {
                return this.name;
            });
            dato.each(the._$inputs, function (i, $item) {
                var name = $item.name;

                if (name && !the._pathMap[name] && !$item.hidden && !$item.disabled && !$item.readOnly) {
                    the._pathMap[name] = $item;
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
            var validationStr = attribute.data($item, options.dataValidation);
            var alias = attribute.data($item, options.dataAlias);
            var validationInfo = the._parseValidation(validationStr);
            var validationList = validationInfo.list;

            // 规则顺序
            // required => type => minLength => maxLength => pattern => data

            if ($item.required) {
                the._validation.addRule(path, 'required');
            }

            if ($item.min !== '' && !typeis.empty($item.min)) {
                the._validation.addRule(path, 'min', $item.min);
            }

            if ($item.max !== '' && !typeis.empty($item.max)) {
                the._validation.addRule(path, 'max', $item.max);
            }

            if ($item.accept !== '' && !typeis.empty($item.accept)) {
                the._validation.addRule(path, 'accept', $item.accept);
            }

            if ($item.pattern !== '' && !typeis.empty($item.pattern)) {
                the._validation.addRule(path, 'pattern', $item.pattern);
            }

            if ($item.step !== '' && !typeis.empty($item.step)) {
                the._validation.addRule(path, 'step', $item.step);
            }

            if (!validationInfo.hasType) {
                switch (type) {
                    case 'number':
                    case 'email':
                    case 'url':
                        the._validation.addRule(path, 'type', type);
                        break;
                }
            }

            validationList.forEach(function (validation) {
                var validationName = validation.name;
                var validationVals = validation.values;
                //
                //if (validationName === 'alias') {
                //    the._validation.setAlias(path, validationVals.join(''));
                //    hasAlias = true;
                //    return;
                //}

                var args = [path, validationName];

                args = args.concat(validationVals);
                the._validation.addRule.apply(the._validation, args);
            });


            if (alias) {
                the._validation.setAlias(path, alias);
            }

            if (!alias) {
                var $label = selector.query('label[for="' + id + '"]', the._$form)[0];

                if ($label) {
                    alias = (attribute.text($label).match(REG_ALIAS) || ['', ''])[1].trim();

                    the._validation.setAlias(path, alias);
                }
            }

            if (!alias && $item.placeholder) {
                alias = ($item.placeholder.match(REG_ALIAS) || ['', ''])[1].trim();

                if (alias) {
                    the._validation.setAlias(path, alias);
                }
            }
        },


        /**
         * 解析 data 验证规则
         * @param ruleString
         * @returns {Object}
         * @private
         */
        _parseValidation: function (ruleString) {
            var the = this;
            var options = the._options;

            if (!ruleString) {
                return {
                    list: [],
                    hasType: false
                };
            }

            var list1 = ruleString.split(options.dataSep);
            var list2 = [];
            // 是否重写了 type
            var hasType = false;

            list1.forEach(function (item) {
                var temp = item.split(options.dataEqual);
                var name = temp[0].trim();

                hasType = name === 'type';
                list2.push({
                    name: name,
                    values: temp[1] ? temp[1].trim().split('|') : true
                });
            });

            return {
                list: list2,
                hasType: hasType
            };
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

    ValidationUI.defaults = defaults;
    module.exports = ValidationUI;
});