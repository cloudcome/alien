/**
 * ui markdown
 * @author ydr.me
 * @create 2015-12-23 14:38
 */


define(function (require, exports, module) {
    'use strict';

    var marked = require('../../3rd/marked.js');
    var ui = require('../index.js');
    var Textarea = require('../textarea/index.js');
    var controller = require('../../utils/controller.js');
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
    var markedRender = new marked.Renderer();
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
        footers: [],
        tabSize: 4
    };
    var Markdown = ui.create({
        constructor: function ($textarea, options) {
            var the = this;

            the._eTextarea = selector.query($textarea)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._index = alienIndex++;
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
            var html = tpl.render({
                index: the._index
            });
            var node = the._eMarkdown = modification.parse(html)[0];
            var $flag = the._eFlag = modification.create('#comment', namespace + '-' + the._index);

            attribute.css(node, options.style);
            modification.insert($flag, the._eTextarea, 'afterend');
            modification.insert(node, $flag, 'afterend');
            var nodes = selector.query('.j-flag', node);
            the._eHeader = nodes[0];
            the._eInput = nodes[1];
            the._eOutput = nodes[2];
            the._eFooter = nodes[3];
            modification.insert(the._eTextarea, the._eInput);
            the._textarea = new Textarea(the._eTextarea, {
                tabSize: options.tabSize
            });
        },

        _initEvent: function () {
            var the = this;

            // fullscreen
            the._live = false;
            the._textarea.bind('ctrl+f12 cmd+f12', function () {
                var className = namespace + '-fullscreen';
                if (the._live) {
                    attribute.removeClass(the._eMarkdown, className);
                } else {
                    attribute.addClass(the._eMarkdown, className);
                    attribute.css(the._eMarkdown, 'zIndex', ui.getZindex());
                }
                the._live = !the._live;
                return false;
            });

            the._textarea.bind('`', function () {
                the._textarea.wrap('`', '`', true);
                return false;
            });

            // live
            the._textarea.on('change', controller.debounce(function () {
                if (!the._live) {
                    return;
                }

                the._eOutput.innerHTML = marked(the._textarea.getValue(), {
                    renderer: markedRender
                });
            }));
        }
    });

    ui.importStyle(style);
    Markdown.defaults = defaults;
    module.exports = Markdown;
});