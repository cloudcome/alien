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

    var defaults = {
        // 内容样式
        contentStyle: require('./content-style.css', 'css'),
        height: 300,
        minHeight: 100,
        maxHeight: 1000
    };
    var Editor = ui.create({
        constructor: function (textareaEl, options) {
            var the = this;

            the._textareaEl = selector.query(textareaEl)[0];
            the._options = dato.extend({}, defaults, options);
            the._initNode();
        },


        _initNode: function () {
            var the = this;
            var options = the._options;
            var textareaEl = the._textareaEl;
            var id = textareaEl.id;

            id = textareaEl.id = id || 'editor-' + random.guid();
            the._editor = tinymce.init({
                selector: '#' + id,
                content_style: options.contentStyle,
                height: options.height,
                min_height: options.minHeight,
                max_height: options.maxHeight
            });
        }
    });

    Editor.defaults = defaults;
    module.exports = Editor;
});