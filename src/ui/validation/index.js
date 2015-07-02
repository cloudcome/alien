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
    var event = require('../../core/event/touch.js');
    var Validation = require('../../libs/validation.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var ui = require('../');
    var defaults = {
        // true: 返回单个错误对象
        // false: 返回错误对象组成的数组
        // 浏览器端，默认为 false
        // 服务器端，默认为 true
        isBreakOnInvalid: typeis.window(window) ? false : true,
        defaultMsg: '${path}字段不合法',
        itemSelector: 'input,select,textarea',
        submitSelector: '.form-submit'
    };
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

            the._validation = new Validation(the._options);
            the._validation.pipe(the);
            the._parseItems();

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

                data[path] = $item.value;
            });

            return data;
        },


        _initEvent: function () {
            var the = this;
            var options = the._options;

            event.on(the._$form, 'click', options.submitSelector, the._onsubmit = function () {
                the._validation.validate(the.getData());
            });
        },


        /**
         * 解析表单项目
         * @private
         */
        _parseItems: function () {
            var the = this;
            var options = the._options;

            the._items = [];
            the._$items = selector.query(options.itemSelector, the._$form);
            dato.each(the._$items, function (i, $item) {
                the._parseRules($item);
            });
        },


        /**
         * 解析项目规则
         * @param $item {Object}
         * @private
         */
        _parseRules: function ($item) {
            var the = this;
            var path = $item.name;

            if ($item.required) {
                the._validation.addRule(path, 'required');
            }
        }
    });


    require('./rules.js');
    ValidationUI.defaults = defaults;
    module.exports = ValidationUI;
});