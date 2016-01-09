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
    var number = require('../../utils/number.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var eventParser = require('../../utils/event.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var Emitter = require('../../libs/emitter.js');
    var Template = require('../../libs/template.js');
    var Hotkey = require('../hotkey/index.js');
    var CtrlList = require('../ctrl-list/index.js');
    var template = require('template.html', 'html');
    var tpl = new Template(template);
    var style = require('./style.css', 'css');
    var namespace = 'alien-ui-markdown';
    var alienIndex = 0;
    var markedImage = require('./_marked-image.js');
    var markedTable = require('./_marked-table.js');
    var REG_ORDER = /^\s*([1-9]\d*)\. /;
    var REG_UNORDER = /^\s*([-+*]) /;
    var ctrlKey = Hotkey.MAC_OS ? 'cmd' : 'ctrl';
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
        tabSize: 4,
        prevClassName: '',
        imageClassName: 'img',
        tableClassName: 'table table-radius table-bordered table-hover',
        // {
        //     image: '', // 如：用户头像，可省略
        //     text: '',  // 如：用户昵称，可省略
        //     value: '', // 如：用户ID，必填
        // }
        atList: [],
        helps: [{
            key: ctrlKey + '+F11',
            desc: '全屏写作模式'
        }, {
            key: ctrlKey + '+F12',
            desc: '全屏预览模式'
        }, {
            key: ctrlKey + '+B',
            desc: '粗体'
        }, {
            key: ctrlKey + '+I',
            desc: '斜体'
        }, {
            key: ctrlKey + '+E',
            desc: '删除线'
        }, {
            key: ctrlKey + '+R',
            desc: '分割线'
        }, {
            key: ctrlKey + '+K',
            desc: '代码块'
        }, {
            key: ctrlKey + '+T',
            desc: '插入表格'
        }, {
            key: ctrlKey + '+G',
            desc: '插入图片'
        }, {
            key: ctrlKey + '+L',
            desc: '插入链接'
        }, {
            key: 'shift+enter',
            desc: '软回车'
        }, {
            key: ctrlKey + '+X',
            desc: '剪切'
        }, {
            key: ctrlKey + '+Z',
            desc: '撤销'
        }, {
            key: ctrlKey + '+shift+Z',
            desc: '恢复'
        }]
    };
    var Markdown = ui.create({
        constructor: function ($textarea, options) {
            var the = this;

            the._eTextarea = selector.query($textarea)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._index = alienIndex++;
            the._initNode();
            the._initEvent();
            the.updateAtList(the._options.atList);
        },


        /**
         * 更新 atList
         * @param atList
         * @returns {Markdown}
         */
        updateAtList: function (atList) {
            var the = this;

            the._atList = atList;
            the._ctrlList.update(atList);
            return the;
        },


        /**
         * 获取 atList
         * @returns {Array.<T>}
         */
        getAtList: function () {
            return this._atList;
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var html = tpl.render({
                index: the._index,
                prevClassName: options.prevClassName,
                helps: options.helps
            });
            var node = the._eMarkdown = modification.parse(html)[0];
            var $flag = the._eFlag = modification.create('#comment', namespace + '-' + the._index);

            attribute.css(node, options.style);
            attribute.prop(the._eTextarea, 'spellcheck', false);
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
            the._ctrlList = new CtrlList();
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var eTextarea = the._eTextarea;
            var options = the._options;
            var markedRender = new marked.Renderer();
            markedRender.image = markedImage({
                className: options.imageClassName
            });
            markedRender.table = markedTable({
                className: options.tableClassName
            });
            var render = controller.debounce(function () {
                the._eOutput.innerHTML = marked(the._textarea.getValue(), {
                    renderer: markedRender
                });
            });
            // 全屏
            var fullscreen = false;
            // 写作模式
            var writen = false;
            // 预览模式
            var live = false;
            // 切换全屏模式
            var toggleFullscreen = function (boolean) {
                var className = namespace + '-fullscreen';

                if (boolean) {
                    attribute.addClass(the._eMarkdown, className);
                } else {
                    attribute.removeClass(the._eMarkdown, className);
                }

                fullscreen = boolean;
            };
            // 切换写作模式
            var toggleWriten = function (boolean) {
                var className = namespace + '-writen';

                if (boolean) {
                    attribute.addClass(the._eMarkdown, className);
                } else {
                    attribute.removeClass(the._eMarkdown, className);
                }

                writen = boolean;
            };
            // 切换预览模式
            var toggleLive = function (boolean) {
                var className = namespace + '-live';

                if (boolean) {
                    attribute.addClass(the._eMarkdown, className);
                    render();
                } else {
                    attribute.removeClass(the._eMarkdown, className);
                }

                live = boolean;
            };

            var ctrl = Hotkey.MAC_OS ? 'cmd' : 'ctrl';
            Emitter.pipe(the._textarea, the);

            // fullscreen
            the._textarea.bind(ctrl + '+f11', function () {
                if (fullscreen) {
                    if (live) {
                        toggleLive(false);
                        toggleWriten(true);
                    } else {
                        toggleFullscreen(false);
                        toggleWriten(false);
                    }
                } else {
                    toggleFullscreen(true);
                    toggleWriten(true);
                }
                return false;
            });

            // live
            the._textarea.bind(ctrl + '+f12', function () {
                if (fullscreen) {
                    if (writen) {
                        toggleWriten(false);
                        toggleLive(true);
                    } else {
                        toggleFullscreen(false);
                        toggleLive(false);
                    }
                } else {
                    toggleFullscreen(true);
                    toggleLive(true);
                }
                return false;
            });

            // `code`
            the._textarea.bind('`', function () {
                the._textarea.wrap('`', '`', true);
                return false;
            });

            // **bold**
            the._textarea.bind(ctrl + '+b', function () {
                the._textarea.wrap('**', '**', true);
                return false;
            });

            // **italic**
            the._textarea.bind(ctrl + '+i', function () {
                the._textarea.wrap('*', '*', true);
                return false;
            });

            // ~~strikethough~~
            the._textarea.bind(ctrl + '+u', function () {
                the._textarea.wrap('~~', '~~', true);
                return false;
            });

            // -----
            the._textarea.bind(ctrl + '+r', function () {
                the._textarea.insert('\n\n-----\n\n', false);
                return false;
            });

            // [](link)
            the._textarea.bind(ctrl + '+l', function () {
                var link_url = 'link url';
                the._textarea.insert('<' + link_url + '>', [1, link_url.length + 1]);
                return false;
            });

            // ![](image)
            the._textarea.bind(ctrl + '+g', function () {
                var link_url = 'image url';
                the._textarea.insert('![](' + link_url + ')', [4, link_url.length + 4]);
                return false;
            });

            // \n```\nblock code\n```\n
            the._textarea.bind(ctrl + '+k', function () {
                var lines = the._textarea.getLines();
                var lineLength = lines.length;
                var lastLine = lines[lineLength - 1];
                the._textarea.wrap('\n```\n', (!lastLine.text.length && lineLength.length > 1 ? '' : '\n') + '```\n\n', true);
                return false;
            });

            // table
            the._textarea.bind(ctrl + '+e', function () {
                var thead1 = 'thead1';
                the._textarea.insert('\n\n' + thead1 + ' | thead2\n-------|--------\ntd1    | td2  \n\n', [2, 2 + thead1.length]);
                return false;
            });

            // @
            the._textarea.bind('shift+2', function () {
                the.emit('at');
                var pos = the._textarea.getSelectionRect().start;
                the._ctrlList.open(pos);
            });

            // choose at one
            the._ctrlList.on('sure', function (people) {
                the._textarea.insert(people.value + ' ', false);
                return false;
            });

            // cancel at
            the._textarea.bind('backspace', function () {
                the._ctrlList.close();
            });

            the._textarea.bind('enter', function () {
                controller.nextFrame(function () {
                    console.log(the._eTextarea.selectionStart);
                    var nowLine0 = the._textarea.getLines()[0];
                    var prevSel = the._textarea.getSelection();
                    // 减去当前行的空白，定位到上一行末尾
                    var prevLines = the._textarea.getLines(prevSel[0] - 1 - nowLine0.text.length);
                    var prevLine0 = prevLines[0];
                    var prevText0 = prevLine0.text;
                    var match;

                    // order list
                    if ((match = prevText0.match(REG_ORDER))) {
                        var nextOrder = number.parseInt(match[1]) + 1;
                        the._textarea.insert(nextOrder + '. ', false);
                    }
                    // unorder list
                    else if ((match = prevText0.match(REG_UNORDER))) {
                        var nextUnorder = match[1];
                        the._textarea.insert(nextUnorder + ' ', false);
                    }
                });

                return false;
            });

            // live
            the._textarea.on('change', function () {
                the._eCount.innerHTML = this.getValue().length;
                if (!live) {
                    return;
                }

                render();
            });

            // scroll
            event.on(eTextarea, 'scroll', controller.throttle(function () {
                if (!live) {
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
                    var alt = img.title || 'img description';
                    var text = '!['.concat(
                        alt,
                        '](',
                        img.url,
                        img.width ? ' =' + img.width + 'x' + img.height : '',
                        ')');
                    the._textarea.insert(text, [2, alt.length + 2]);
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