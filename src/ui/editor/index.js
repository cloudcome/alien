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

    var defaults = {
        // 内容样式
        contentStyle: ''
    };
    var Editor = ui.create({
        constructor: function (textareaEl, options) {
            var the = this;

            textareaEl = the._textareaEl = selector.query(textareaEl)[0];
            options = the._options = dato.extend({}, defaults, options);
            the._editor = tinymce.init({
                selector: textareaEl,
                content_style: options.contentStyle
            });
        }
    });

    Editor.defaults = defaults;
    module.exports = Editor;
});