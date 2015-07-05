/*!
 * 表单处理
 * @author ydr.me
 * @create 2015-07-05 13:49
 */


/*============================================
 = <form class="form">
 =    <ul class="form-list">
 =    <li class="form-item">
 =        <input/>
 =        <p class="form-msg"></p>
 =    </li>
 =============================================*/


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var ui = require('../index.js');
    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');
    var typeis = require('../../utils/typeis.js');
    var qs = require('../../utils/querystring.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var xhr = require('../../core/communication/xhr.js');
    var Validation = require('../validation/index.js');
    var Emitter = require('../../libs/emitter.js');
    var formButtonCanSubmit = false;
    var win = window;
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        breakOnInvalid: typeis.window(window) ? false : true,
        defaultMsg: '${path}字段不合法',
        // 规则的 data 属性
        dataAttribute: 'validation',
        // data 规则分隔符
        dataSep: ',',
        // data 规则等于符
        dataEqual: ':',
        // 验证的表单项目选择器
        inputSelector: 'input,select,textarea',
        // 表单项目选择器
        itemSelector: '.form-item',
        // 表单提交选择器
        submitSelector: '.form-submit',
        // 验证消息类
        itemMsgClass: 'form-msg',
        // 验证合法时，添加的样式类
        itemSuccessClass: 'has-success',
        // 验证非法时，添加的样式类
        itemErrorClass: 'has-error',
        // 验证合法时，显示消息
        validMsg: '填写合法',
        // 验证非法时，是否自动聚焦
        invalidAutoFocus: true,
        // 表单输入框验证事件
        inputValidateEvent: 'input change',
        // 是否调试模式，调试模式则不会提交表单
        debug: false
    };
    var Form = ui.create({
        constructor: function ($form, options) {
            var the = this;

            the._$form = selector.query($form)[0];
            the._isForm = the._$form.tagName === 'FORM';
            the._options = dato.extend({}, defaults, options);
            the._validation = new Validation(the._$form, the._options);
            the._msgMap = {};
            the._initNode();
            the._initEvent();
        },


        /**
         * 更新表单信息
         * @returns {Form}
         */
        update: function () {
            var the = this;

            the._validation.update();

            return the;
        },


        /**
         * 表单提交
         */
        submit: function () {
            var the = this;

            the._validation.validate();
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            //var options = the._options;

            if (the._isForm) {
                the._xhrOptions = {
                    url: the._$form.action,
                    headers: {
                        'content-type': the._$form.enctype
                    },
                    method: the._$form.method
                };
            }
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;

            if (the._isForm) {
                var submitSelector = 'button[type="submit"],input[type="submit"]';

                if (formButtonCanSubmit) {
                    submitSelector += ',button';
                }

                event.on(the._$form, 'click', submitSelector, function (eve) {
                    eve.preventDefault();
                    the.submit();
                });
            } else {
                event.on(the._$form, 'click', options.submitSelector, the.submit.bind(the));
            }

            if (options.inputValidateEvent) {
                event.on(the._$form, options.inputValidateEvent, options.inputSelector, function () {
                    the._validation.validate(this);
                });
            }

            var $firstInvalidInput = null;

            the._validation
                .on('valid', function ($input) {
                    if ($input === $firstInvalidInput) {
                        $firstInvalidInput = null;
                    }

                    the._setMsg($input);
                })
                .on('invalid', function (err, $input) {
                    the._setMsg($input, err);

                    if (!$firstInvalidInput) {
                        $firstInvalidInput = $input;
                    }
                })
                .on('success', the._submit.bind(the))
                .on('error', function () {
                    controller.nextFrame(function () {
                        try {
                            $firstInvalidInput.focus();
                            $firstInvalidInput = null;
                        } catch (err) {
                            // ignore
                        }
                    });
                });
        },


        /**
         * 提交数据
         * @private
         */
        _submit: function () {
            var the = this;
            var data = the._validation.getData();
            var body;

            switch (the._xhrOptions.headers['content-type']) {
                case 'multipart/form-data':
                    body = new win.FormData();
                    dato.each(data, function (name, val) {
                        body.append(name, val);
                    });
                    break;

                case 'text/plain':
                    body = [];
                    dato.each(data, function (name, val) {
                        body.push(name + '=' + val);
                    });
                    body = body.join('\n');
                    break;

                //case 'application/x-www-form-urlencoded':
                default:
                    body = qs.stringify(data);
            }

            var options = {
                url: the._xhrOptions.url,
                method: the._xhrOptions.method.toLowerCase(),
                headers: the._xhrOptions.headers
            };

            if (options.method === 'get') {
                options.query = body;
            } else {
                options.body = body;
            }

            if (the._xhr) {
                the._xhr.abort();
            }

            if (options.debug) {
                return;
            }

            /**
             * 请求之前
             * @event beforerequest
             * @param options {Object} 请求参数
             */
            if (the.emit('beforerequest', options) === false) {
                return;
            }

            the._xhr = xhr.ajax(options);
            Emitter.pipe(the._xhr, the);
        },


        /**
         * 设置消息
         * @param $input
         * @param [err]
         * @private
         */
        _setMsg: function ($input, err) {
            var the = this;
            var options = the._options;
            var $item = selector.closest($input, options.itemSelector)[0];
            var $msg = the._msgMap[$input.name];

            if (!$item) {
                return;
            }

            if (!$msg) {
                $msg = selector.query('.' + options.itemMsgClass, $item)[0];

                if (!$msg) {
                    $msg = modification.create('div', {
                        class: options.itemMsgClass
                    });
                    modification.insert($msg, $item);
                }

                the._msgMap[$input.name] = $msg;
            }

            if (err) {
                attribute.removeClass($item, options.itemSuccessClass);
                attribute.addClass($item, options.itemErrorClass);
            } else {
                attribute.removeClass($item, options.itemErrorClass);
                attribute.addClass($item, options.itemSuccessClass);
            }

            attribute.html($msg, err ? err.message : options.validMsg);
        }
    });

    Form.defaults = defaults;
    _formButtonCanSubmit();
    module.exports = Form;

    // ==============================================================================
    // ==============================================================================
    // ==============================================================================

    /**
     * 检测 form button 是否支持 submit
     * @private
     */
    function _formButtonCanSubmit() {
        var $form = modification.create('form');
        var $button = modification.create('button');

        modification.insert($button, $form);
        modification.insert($form, document.body);
        event.on($form, 'submit', function () {
            formButtonCanSubmit = true;
            return false;
        });
        event.dispatch($button, 'click');
        controller.nextFrame(function () {
            modification.remove($form);
        });
    }
});