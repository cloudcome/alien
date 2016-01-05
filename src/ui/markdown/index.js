/**
 * ui markdown
 * @author ydr.me
 * @create 2015-12-23 14:38
 */


define(function (require, exports, module) {
    'use strict';

    var w = window;
    var d = w.document;
    var marked = require('../../3rd/marked.js');
    var ui = require('../index.js');
    var Textarea = require('../textarea/index.js');
    var controller = require('../../utils/controller.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var eventParser = require('../../utils/event.js');
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
    markedRender.image = require('./_marked-render-image.js');
    markedRender.table = require('./_marked-render-table.js');
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
            the._eCount = nodes[3];
            the._eHelp = nodes[4];
            the._eTips = nodes[5];
            modification.insert(the._eTextarea, the._eInput);
            the._textarea = new Textarea(the._eTextarea, {
                tabSize: options.tabSize
            });
        },

        _initEvent: function () {
            var the = this;
            var eTextarea = the._eTextarea;
            var render = controller.debounce(function () {
                the._eOutput.innerHTML = marked(the._textarea.getValue(), {
                    renderer: markedRender
                });
            });

            // fullscreen
            the._live = false;
            the._textarea.bind('ctrl+f12 cmd+f12', function () {
                var className = namespace + '-fullscreen';
                if (the._live) {
                    attribute.removeClass(the._eMarkdown, className);
                } else {
                    attribute.addClass(the._eMarkdown, className);
                    attribute.css(the._eMarkdown, 'zIndex', ui.getZindex());
                    render();
                }
                the._live = !the._live;
                return false;
            });

            // `code`
            the._textarea.bind('`', function () {
                the._textarea.wrap('`', '`', true);
                return false;
            });

            // **bold**
            the._textarea.bind('ctrl+b cmd+b', function () {
                the._textarea.wrap('**', '**', true);
                return false;
            });

            // **italic**
            the._textarea.bind('ctrl+i cmd+i', function () {
                the._textarea.wrap('*', '*', true);
                return false;
            });

            // -----
            the._textarea.bind('ctrl+h cmd+h', function () {
                the._textarea.insert('\n\n-----\n\n');
                return false;
            });

            // \n```\nblock code\n```\n
            the._textarea.bind('ctrl+k cmd+k', function () {
                the._textarea.wrap('\n```\n', '\n```\n\n', true);
                return false;
            });

            // live
            the._textarea.on('change', function () {
                the._eCount.innerHTML = this.getValue().length;
                if (!the._live) {
                    return;
                }

                render();
            });

            // scroll
            event.on(eTextarea, 'scroll', controller.throttle(function () {
                if (!the._live) {
                    return;
                }

                var inputScrollTop = attribute.scrollTop(eTextarea);
                var inputScrollHeight = attribute.scrollHeight(eTextarea);
                var inputScrollRate = inputScrollTop / inputScrollHeight;
                var outputScrollHeight = attribute.scrollHeight(the._eOutput);
                the._eOutput.scrollTop = outputScrollHeight * inputScrollRate;
            }));

            // drag
            event.on(eTextarea, 'dragenter dragover', function () {
                return false;
            });

            var onUploadSuccess = function (img) {
                if (typeis.String(img)) {
                    img = {url: img};
                }

                if (img && img.url) {
                    var text = '!['.concat(
                        img.title || '',
                        '](',
                        img.url,
                        img.width ? ' =' + img.width + 'x' + img.height : '',
                        ')');
                    the._textarea.insert(text);
                }
            };

            // upload
            event.on(eTextarea, 'paste drop', function (eve) {
                var img = eventParser.parseFiles(eve, this)[0];

                if (!img) {
                    return;
                }

                the.emit('upload', eve, img, onUploadSuccess);
            });

            // show help
            event.on(the._eHelp, 'click', function () {
                attribute.css(the._eTips, 'zIndex', ui.getZindex());
                attribute.show(the._eTips, 'block');
                return false;
            });

            // stop propagation
            event.on(the._eTips, 'click', function (eve) {
                eve.stopPropagation();
            });

            event.on(d, 'click esc', function () {
                attribute.hide(the._eTips);
            });
        }
    });

    ui.importStyle(style);
    Markdown.defaults = defaults;
    module.exports = Markdown;
});