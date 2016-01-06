/**
 * rich editor
 * @author ydr.me
 * @create 2015-12-24 11:45
 */


define(function (require, exports, module) {
    /**
     * @module ui/editor
     * @requires ui/
     * @requires ui/wysiwyg/
     * @requires ui/tooltip/
     * @requires utils/dato
     * @requires utils/class
     * @requires core/dom/modification
     * @requires core/event/base
     * @requires libs/template
     */

    'use strict';

    var ui = require('../index.js');
    var Wysiwyg = require('../wysiwyg/index.js');
    var Tooltip = require('../tooltip/index.js');
    var dato = require('../../utils/dato.js');
    var klass = require('../../utils/class.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var compatible = require('../../core/navigator/compatible.js');
    var event = require('../../core/event/base.js');
    var Template = require('../../libs/Template.js');
    var template = require('./template.html', 'html');
    var tpl = new Template(template);
    var style = require('./style.css', 'css');
    var icons2x = require('./icons@2x.png', 'image');
    var icons1x = require('./icons@1x.png', 'image');
    var supportBackgroundSize = compatible.css3('background-size');
    var devicePixelRatio = window[compatible.html5('devicePixelRatio', window)];
    var willBackgroundSize = supportBackgroundSize && devicePixelRatio > 1;

    var namespace = 'donkey-ui-editor';
    var donkeyIndex = 0;
    var defaultButtons = {
        bold: {
            text: '加粗',
            command: 'bold'
        },
        italic: {
            text: '斜体',
            command: 'italic'
        },
        underline: {
            text: '下划线',
            command: 'underline'
        },
        forecolor: {
            text: '字体颜色',
            command: 'color',
            type: 1
        },
        backcolor: {
            text: '背景颜色',
            command: 'color',
            type: 2
        },
        heading: {
            text: '标题',
            command: 'heading'
        },
        justifyleft: {
            text: '左对齐',
            command: 'justifyLeft'
        },
        justifycenter: {
            text: '居中对齐',
            command: 'justifyCenter'
        },
        justifyright: {
            text: '右对齐',
            command: 'justifyRight'
        },
        justifyfull: {
            text: '两端对齐',
            command: 'justifyFull'
        },
        orderlist: {
            text: '有序列表',
            command: 'insertOrderedList'
        },
        unorderlist: {
            text: '无序列表',
            command: 'insertUnorderedList'
        },
        link: {
            text: '添加链接',
            command: 'link'
        },
        unlink: {
            text: '取消链接',
            command: 'unlink'
        },
        line: {
            text: '分割线',
            command: 'line'
        },
        image: {
            text: '图片',
            command: 'image'
        },
        undo: {
            text: '撤销',
            command: 'undo'
        },
        redo: {
            text: '重做',
            command: 'redo'
        },
        '|': {}
    };
    var actions = {};
    var defaults = {
        style: {
            width: 'auto',
            height: 500
        },
        buttons: [
            'bold', 'italic', 'underline', '|',
            'forecolor', 'backcolor', 'heading', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyboth', '|',
            'orderlist', 'unorderlist', '|',
            'link', 'unlink', '|',
            'line', 'image'
        ],
        placeholder: '<p style="color:#888">输入，从这里开始</p>',
        addClass: '',
        whiteList: [
            'p', 'div', 'hr', 'ul', 'ol', 'li', 'pre',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'img', 'span', 'a', 'i', 'em', 's', 'u', 'b', 'br', 'small', 'strong', 'code', 'font',
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'
        ]
    };
    var Editor = ui.create({
        constructor: function (eTextarea, options) {
            var the = this;

            the._eTextarea = selector.query(eTextarea)[0];
            the._index = donkeyIndex++;
            the._options = dato.extend({}, defaults, options);
            the._commands = {};
            the._initData();
            the._initNode();
            the._initEvent();
        },


        _initData: function () {
            var the = this;
            var options = the._options;

            the._whiteMap = {};
            dato.each(options.whiteList, function (index, tagName) {
                the._whiteMap[tagName] = 1;
            });
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var buttons = [];

            dato.each(options.buttons, function (index, button) {
                var item = defaultButtons[button];
                if (item) {
                    item.name = button;
                    buttons.push(item);

                    if (actions[item.command]) {
                        the._commands[item.command] = new actions[item.command](the, {
                            type: item.type
                        });
                    }
                }
            });

            var html = tpl.render({
                index: the._index,
                buttons: buttons
            });

            the._buttons = buttons;
            var eEditor = the._eEditor = modification.parse(html)[0];
            modification.insert(eEditor, the._eTextarea, 'afterend');
            attribute.addClass(eEditor, options.addClass);
            var eIcons = selector.query('.' + namespace + '-icon', eEditor);

            dato.each(eIcons, function (index, ele) {
                var buttonIndex = attribute.data(ele, 'index');
                var btn = buttons[buttonIndex];

                if (btn) {
                    btn.ele = ele;
                }
            });
            var nodes = selector.query('.j-flag', eEditor);
            var content = the._eTextarea.value;
            attribute.hide(the._eTextarea);
            the._eHeader = nodes[0];
            the._eContent = nodes[1];
            the._eFooter = nodes[2];
            the._placeholder = false;

            if (!content && options.placeholder) {
                content = options.placeholder;
                the._placeholder = true;
            }

            attribute.css(the._eContent, options.style);
            attribute.html(the._eContent, content);
            the._wysiwyg = new Wysiwyg(the._eContent);
            the._tooltip = new Tooltip({
                selector: '.' + namespace + '-icon',
                timeout: 100,
                style: {
                    maxWidth: 'none',
                    minWidth: 'none',
                    textAlign: 'center'
                }
            });

            dato.each(buttons, function (index, item) {
                if (actions[item.command]) {
                    the._commands[item.command] = new actions[item.command](the, {
                        type: item.type
                    });
                }
            });
        },


        /**
         * 获取内容节点
         * @returns {*}
         */
        getNode: function () {
            return this._eEditor;
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;

            event.on(the._eHeader, 'mousedown', '.' + namespace + '-icon', the._onmousedown = function (eve) {
                the._wysiwyg.saveSelection();
            });

            event.on(the._eHeader, 'click', '.' + namespace + '-icon', the._onclick1 = function (eve) {
                var command = attribute.data(this, 'command');
                var type = attribute.data(this, 'type') || '';

                if (!command) {
                    return;
                }

                var action = command + type;
                if (action && actions[command] && the._commands[action]) {
                    // open popup
                    if (the._commands[action].open) {
                        the._commands[action].open(this);
                    }
                    // direct execute
                    else if (the._commands[action].exec) {
                        the._commands[action].exec();
                    }
                } else if (command && the._wysiwyg[command]) {
                    the._wysiwyg[command]();
                }

                eve.preventDefault();
            });

            // 选中图片
            event.on(the._eContent, 'click', 'img', the._onclick2 = function (eve) {
                the._wysiwyg.select(this);
            });

            the._wysiwyg.on('selectionChange contentChange', function () {
                if (the._placeholder) {
                    the._placeholder = false;
                    the._wysiwyg.setHTML('');
                }

                dato.each(the._buttons, function (index, btn) {
                    var command = btn.command;
                    var isState = the._wysiwyg.isState(command);
                    var className = namespace + '-icon-active';

                    if (isState) {
                        attribute.addClass(btn.ele, className);
                    } else {
                        attribute.removeClass(btn.ele, className);
                    }
                });

                the.sync();
            });
        },


        /**
         * 清理 HTML
         * @private
         */
        _clean: function () {
            var the = this;

            var eNodes = selector.query('*', the._eContent);

            dato.each(eNodes, function (index, node) {
                var tagName = node.tagName.toLowerCase();
                var isWhite = the._whiteMap[tagName];

                if (!isWhite) {
                    modification.remove(node);
                }
            }, true);
        },


        /**
         * 设置 HTML
         * @param html
         * @returns {Editor}
         */
        setHTML: function (html) {
            var the = this;

            the._placeholder = false;
            the._wysiwyg.setHTML(html);

            return the;
        },


        /**
         * 获取 HTML 内容
         * @returns {string}
         */
        getHTML: function () {
            var the = this;

            the._clean();

            return the._wysiwyg.getHTML();
        },


        /**
         * 同步内容
         * @returns {String}
         */
        sync: function () {
            var the = this;
            var html = the.getHTML();

            the._eTextarea.value = html;

            return html;
        },


        /**
         * 获取 Text
         * @returns {string}
         */
        getText: function () {
            var the = this;

            the._clean();

            return the._wysiwyg.getText();
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            // 销毁命令
            dato.each(the._commands, function (action, commander) {
                commander.destroy();
            });

            // 销毁 wysywyg
            the._wysiwyg.destroy();

            // 移除事件
            event.un(the._eHeader, 'mousedown', the._onmousedown);
            event.un(the._eHeader, 'click', the._onclick1);
            event.un(the._eContent, 'click', the._onclick2);

            // 恢复 DOM
            modification.remove(the._eEditor);
            attribute.show(the._eTextarea);
        }
    });


    /**
     * 注册编辑器命令
     * @param command
     * @param commander
     */
    Editor.action = function (command, commander) {
        actions[command] = commander;
    };

    // import actions
    Editor.action('color', require('./_actions/color/index.js'));
    Editor.action('heading', require('./_actions/heading/index.js'));
    Editor.action('link', require('./_actions/link/index.js'));
    Editor.action('line', require('./_actions/line/index.js'));
    Editor.action('image', require('./_actions/image/index.js'));

    // style
    style += '.' + namespace + '-icon:after{' +
            /**/'background-image: url(' + (willBackgroundSize ? icons2x : icons1x) + ');' +
            /**/(willBackgroundSize ? '-webkit-background-size: 200px 40px;' : '') +
            /**/(willBackgroundSize ? 'background-size: 200px 40px;' : '') +
        '}';
    ui.importStyle(style);

    // exports
    Editor.defaults = defaults;
    klass.transfer(Wysiwyg, Editor, '_wysiwyg');
    module.exports = Editor;
});