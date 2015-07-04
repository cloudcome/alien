/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-04 23:11
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var dato = require('../../utils/dato.js');
    var ui = require('../index.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var xhr = require('../../core/communication/xhr.js');
    var defaults = {
        // 数据的 text 键名
        textName: 'text',
        // 数据的 value 键名
        valueName: 'value',
        // 请求数据的键名
        queryName: 'parent',
        // 获取级联数据的 urls
        // 执行普通的 get 请求
        urls: [],
        // select 选择器，默认为父级下的前几个
        selectSelectors: [],
        cache: true,
        placeholder: {
            text: '请选择',
            value: ''
        }
    };
    var Linkage = ui.create({
        constructor: function ($parent, options) {
            var the = this;

            the._$parent = selector.query($parent)[0];
            the._options = dato.extend({}, defaults, options);
            the.values = [];
            the._initNode();
            // 初始加载第一级
            the.change(0);
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;

            the._$selects = [];

            if (options.selectSelectors.length) {
                dato.each(options.selectSelectors, function (index, sel) {
                    the._$selects.push(selector.query(sel, the._$parent)[0]);
                });
            } else {
                the._$selects = selector.query('select', the._$parent);
            }
        },


        change: function (index, value) {

        },


        /**
         * 获取级联数据
         * @param index {Number} 当前级联索引值
         * @private
         */
        _getData: function (index) {
            var the = this;
            var options = the._options;

            if (the.emit('beforedata', index) === false) {
                return;
            }

            var query = {};

            query[options.queryName] = index > 0 ? the.values[index - 1] : '';
            xhr.get(options.urls[index], query).on('success', function (list) {
                the._renderOption(index, list);
            }).on('error', function (err) {
                the.emit('error', err);
            });
        },


        /**
         * 渲染 select option
         * @param index
         * @param list
         * @returns {string}
         * @private
         */
        _renderOption: function (index, list) {
            var the = this;
            var options = the._options;
            var selectOptions = '';

            if (options.placeholder && options.placeholder.text) {
                list.push(options.placeholder);
            }

            dato.each(list, function (i, item) {
                var text = item[options.textName];
                var value = item[options.valueName];

                selectOptions += '<option value="' + value + '">' + text + '</option>';
            });

            attribute.html(the._$selects[index], selectOptions);
        }
    });

    Linkage.defaults = defaults;
    module.exports = Linkage;
});