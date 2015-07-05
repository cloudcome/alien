/*!
 * 表单处理
 * @author ydr.me
 * @create 2015-07-05 13:49
 */


/*============================================
 <form class="form">
 <ul class="form-list">
 <li class="form-item">
 <input/>
 <p class="form-msg"></p>
 </li>
 ============================================*/


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var ui = require('../index.js');
    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');
    var typeis = require('../../utils/typeis.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var Validation = require('../validation/index.js');
    var formButtonCanSubmit = false;
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
        itemSelector: 'input,select,textarea',
        formItemSelector: '.form-item',
        formMsgSelector: '.form-msg',
        formSubmitSelector: '.form-submit',
        formItemSuccessClass: 'has-success',
        formItemErrorClass: 'has-error'
    };
    var Form = ui.create({
        constructor: function ($form, options) {
            var the = this;

            the._$form = selector.query($form)[0];
            the._isForm = the._$form.tagName === 'FORM';
            the._options = dato.extend({}, defaults, options);
            the._validation = new Validation(the._$form, the._options);
            the._initEvent();
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
                event.on(the._$form, 'click', options.formSubmitSelector, the.submit.bind(the));
            }

            the._validation.on('error', function (err, $input) {
                the._setMsg($input, err);
            });
        },


        /**
         * 表单提交
         */
        submit: function () {
            var the = this;

            the._validation.validate();
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
            var $item = selector.closest($input, options.formItemSelector)[0];
            var $msg = selector.query(options.formMsgSelector, $item)[0];

            if (err) {
                attribute.removeClass($item, options.formItemSuccessClass);
                attribute.addClass($item, options.formItemErrorClass);
            } else {
                attribute.removeClass($item, options.formItemErrorClass);
                attribute.addClass($item, options.formItemSuccessClass);
            }

            attribute.html($msg, err ? err.message : '');
        }
    });

    Form.defaults = defaults;
    _formButtonCanSubmit();
    module.exports = Form;

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