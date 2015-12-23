/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-23 14:38
 */


define(function (require, exports, module) {
    'use strict';

    var marked = require('../../3rd/marked.js');
    var ui = require('../index.js');
    var dato = require('../../utils/dato.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var Template = require('../../libs/template.js');
    var template = require('template.html', 'html');
    var tpl = new Template(template);
    var style = require('./style.css', 'css');

    var namespace = 'alien-ui-markdown';
    var alienIndex = 0;
    var defaults = {
        marked: {
            highlight: null,
            renderer: new marked.Renderer(),
            gfm: true,
            tables: true,
            breaks: true,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: true
        },
        style: {
            width: 'auto',
            height: 400
        },
        headers: [],
        footers: []
    };
    var Markdown = ui.create({
        constructor: function ($textarea, options) {
            var the = this;

            the._$textarea = selector.query($textarea)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._index = alienIndex++;
            the._initNode();
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var html = tpl.render({
                index: the._index
            });
            var node = the._$markdown = modification.parse(html)[0];
            var $flag = the._$flag = modification.create('#comment', namespace + '-' + the._index);

            attribute.css(node, options.style);
            modification.insert($flag, the._$textarea, 'afterend');
            modification.insert(node, $flag, 'afterend');
            var nodes = selector.query('.j-flag', node);
            the._$header = nodes[0];
            the._$input = nodes[1];
            the._$output = nodes[2];
            the._$footer = nodes[3];
            modification.insert(the._$textarea, the._$input);
        }
    });

    ui.importStyle(style);
    Markdown.defaults = defaults;
    module.exports = Markdown;
});