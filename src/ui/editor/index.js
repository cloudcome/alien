/**
 * 文件描述
 * @author ydr.me
 * @create 2016-02-02 11:54
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var tinymce = require('../../3rd/tinymce/index.js');
    var ui = require('../index.js');
    var selector = require('../../core/dom/selector.js');
    var dato = require('../../utils/dato.js');
    var random = require('../../utils/random.js');
    var allocation = require('../../utils/allocation.js');

    var defaults = {
        // 内容样式
        contentStyle: require('./content-style.css', 'css'),
        height: 300,
        maxHeight: 800,
        placeholder: '<p style="color:#888">点击开始输入</p>'
    };
    var Editor = ui.create({
        constructor: function (textareaEl, options) {
            var the = this;

            the._textareaEl = selector.query(textareaEl)[0];
            the._options = dato.extend({}, defaults, options);
            the._initNode();
            the._initEvent();
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var textareaEl = the._textareaEl;

            the._editor = tinymce.init({
                ele: textareaEl,
                content_style: options.contentStyle,
                height: options.height,
                min_height: options.minHeight,
                max_height: options.maxHeight,
                placeholder: options.placeholder
            });
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var events = ['upload'];

            dato.each(events, function (index, event) {
                the._editor.on(event, function (args) {
                    args.unshift(event);
                    the.emit.apply(the, args);
                });
            });
        }
    });

    Editor.defaults = defaults;
    module.exports = Editor;
});