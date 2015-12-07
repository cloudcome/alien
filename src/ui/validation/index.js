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
     * @requires utils/controller
     * @requires utils/allocation
     * @requires utils/howdo
     * @requires ui/
     */

    'use strict';

    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/touch.js');
    var Validation = require('../../libs/validation.js');
    require('./validation-rules.js')(Validation);
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var string = require('../../utils/string.js');
    var controller = require('../../utils/controller.js');
    var allocation = require('../../utils/allocation.js');
    var howdo = require('../../utils/howdo.js');
    var ui = require('../');
    // {
    //     minLength: function(ruleValue){
    //         retrun function(value, done){
    //              done(value.length >= ruleValue * 1 ? null : '${path}长度必须大于${0}');
    //         };
    //     };
    // }
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
        defaultMsg: '${1}字段不合法',
        // 规则的 data 属性
        dataValidation: 'validation',
        dataAlias: 'alias',
        dataMsg: 'msg',
        // data 规则分隔符
        dataSep: ',',
        // data 规则等于符
        dataEqual: ':',
        // data 多值分隔符
        dataVal: ':',
        // 验证的表单项目选择器
        inputSelector: 'input,select,textarea'
    };
    var ValidationUI = ui.create({
        constructor: function ($form, options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the._$form = selector.query($form)[0];
            the.className = 'validation';
            the.update();
        },


        /**
         * 更新验证规则
         * @returns {ValidationUI}
         */
        update: function () {
            var the = this;

            the._pathMap = {};
            the._equalMap = {};
            the._validation = new Validation(the._options);
            the._validation
                .on('valid', function (path) {
                    the.emit('valid', the._pathMap[path]);
                })
                .on('invalid', function (err, path) {
                    the.emit('invalid', err, the._pathMap[path]);
                })
                .on('error', function (err, path) {
                    the.emit('error', err, the._pathMap[path]);
                })
                .before('validate', function (path) {
                    the.emit('beforevalidate', the._pathMap[path]);
                })
                .on('validate', function (path) {
                    the.emit('validate', the._pathMap[path]);
                });
            the._parseItems();

            controller.nextTick(function () {
                the.emit('update');
            });

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

            dato.each(list, function (i, ele) {
                var path = ele.name;
                var type = the._getType(ele);
                var val = ele.value;
                var isMultiple = ele.multiple;

                switch (type) {
                    case 'checkbox':
                        data[path] = data[path] || [];

                        if (ele.checked && val) {
                            data[path].push(val);
                        }

                        break;

                    case 'select':
                        if (isMultiple) {
                            data[path] = [];
                        } else {
                            data[path] = '';
                        }

                        dato.repeat(ele.length, function (index) {
                            var eleOption = ele[index];
                            var val = eleOption.value;

                            if (eleOption.selected && val) {
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
                        if (ele.checked) {
                            data[path] = val;
                        }

                        break;

                    case 'file':
                        var files = ele.files;

                        if (isMultiple && files) {
                            data[path] = files.length ? files : [];
                        } else if (files) {
                            data[path] = files.length ? files[0] : null;
                        } else {
                            data[path] = ele.value;
                        }

                        break;

                    default :
                        data[path] = val;
                }
            });

            return data;
        },


        /**
         * 设置值
         * @param ele {String|Object} 待验证的元素
         * @param val {*} 验证值
         * @returns {ValidationUI}
         */
        setData: function (ele, val) {
            var the = this;

            the._validation.setData(typeis.string(ele) ? ele : ele.name, val);

            return the;
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
         * 单独验证某个/些字段
         * @param [$ele] {Object|Array|String} 待验证的对象或字段，可以为多个对象，如果为空则验证全部
         * @param [callback] {Function} 回调
         * @arguments [pass] {Boolean} 是否通过验证
         * @returns {ValidationUI}
         */
        validate: function ($ele, callback) {
            var the = this;
            var options = the._options;
            var data;
            var args = allocation.args(arguments);

            if (typeis.function(args[0])) {
                callback = args[0];
                $ele = null;
            }

            // 单个字段
            if (typeis.string($ele)) {
                $ele = the._pathMap[$ele];
            }

            // 多个字段
            if (typeis.array($ele)) {
                var temp = [];

                dato.each($ele, function (index, path) {
                    temp.push(the._pathMap[path]);
                });

                $ele = temp;
            }

            // 单个元素
            if (typeis.element($ele)) {
                $ele = [$ele];
            }

            var pass = null;
            var oncomplete = function () {
                if (typeis.function(callback)) {
                    callback.call(the, pass);
                }
            };

            if ($ele && 'length' in $ele) {
                howdo.each($ele, function (index, $ele, next) {
                    var path = $ele.name;
                    var equalPath = the._equalMap[path];
                    var select = [path];

                    if (equalPath) {
                        select.push(equalPath);
                    }

                    data = dato.select(the.getData(), select);
                    the._validation.validateOne(data, function (_pass) {
                        if (pass === null || _pass === false) {
                            pass = _pass;
                        }

                        var err = !_pass;

                        // 有错 && 失败继续
                        if (err && !options.breakOnInvalid) {
                            err = false;
                        }

                        next(err);
                    });
                }).follow(oncomplete);
            } else {
                data = the.getData();
                the._validation.validateAll(data, function (_pass) {
                    pass = _pass;
                    oncomplete();
                });
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
         * @param eleInput {Object}
         * @private
         */
        _parseRules: function (eleInput) {
            var the = this;
            var options = the._options;
            var id = eleInput.id;
            var path = eleInput.name;
            var type = the._getType(eleInput);
            var validationStr = attribute.data(eleInput, options.dataValidation);
            var msgStr = attribute.data(eleInput, options.dataMsg);
            var alias = attribute.data(eleInput, options.dataAlias);
            var validationInfo = the._parseValidation(validationStr);
            var validationList = validationInfo.list;
            var msgList = the._parseDataStr(msgStr);

            // 重写消息
            dato.each(msgList, function (index, item) {
                the._validation.setMsg(path, item.key, item.val);
            });

            // 规则顺序
            // required => type => minLength => maxLength => pattern => data

            if (attribute.attr(eleInput, 'required')) {
                the._validation.addRule(path, 'required', true);
            }

            var min = attribute.attr(eleInput, 'min');
            if (min !== '' && !typeis.empty(min)) {
                the._validation.addRule(path, 'min', min);
            }

            var max = attribute.attr(eleInput, 'min');
            if (max !== '' && !typeis.empty(max)) {
                the._validation.addRule(path, 'max', max);
            }

            var accept = $(eleInput).attr('accept');
            if (accept !== '' && !typeis.empty(accept)) {
                the._validation.addRule(path, 'accept', accept);
            }

            var pattern = attribute.attr(eleInput, 'pattern');
            if (pattern !== '' && !typeis.empty(pattern)) {
                the._validation.addRule(path, 'pattern', pattern);
            }

            var step = attribute.attr(eleInput, 'step');
            if (step !== '' && !typeis.empty(step)) {
                the._validation.addRule(path, 'step', step);
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
                var args = [path, validationName];

                if (validationName === 'equal') {
                    the._equalMap[path] = validationVals[0];
                }

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

            if (!alias && eleInput.placeholder) {
                alias = (eleInput.placeholder.match(REG_ALIAS) || ['', ''])[1].trim();

                if (alias) {
                    the._validation.setAlias(path, alias);
                }
            }
        },


        /**
         * 解析 a:b,c:d
         * @param str
         * @returns {Array}
         * @private
         */
        _parseDataStr: function (str) {
            if (!str) {
                return [];
            }

            var the = this;
            var options = the._options;
            var list1 = str.split(options.dataSep);
            var list2 = [];

            list1.forEach(function (item) {
                var temp = item.split(options.dataEqual);

                list2.push({
                    key: temp[0].trim(),
                    val: temp[1] ? temp[1].trim() : ''
                });
            });

            return list2;
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
            var list = the._parseDataStr(ruleString);
            var hasType = false;

            if (!list.length) {
                return {
                    list: [],
                    hasType: false
                };
            }

            var list2 = [];
            list.forEach(function (item) {
                hasType = item.key === 'type';

                list2.push({
                    name: item.key,
                    values: item.val ? item.val.split(options.dataVal) : true
                });
            });

            return {
                list: list2,
                hasType: hasType
            };
        }
    });

    ValidationUI.defaults = defaults;
    module.exports = ValidationUI;
});