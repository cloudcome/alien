/**
 * 图片选择器
 * @author ydr.me
 * @create 2015-12-28 17:36
 */


define(function (require, exports, module) {
    'use strict';

    var w = window;
    var d = w.document;
    var b = d.body;
    var Dialog = require('../../_dialog.js');
    var ui = require('../../../index.js');
    var Tab = require('../../../tab/index.js');
    var klass = require('../../../../utils/class.js');
    var dato = require('../../../../utils/dato.js');
    var eventParser = require('../../../../utils/event.js');
    var event = require('../../../../core/event/base.js');
    var selector = require('../../../../core/dom/selector.js');
    var modification = require('../../../../core/dom/modification.js');
    var attribute = require('../../../../core/dom/attribute.js');
    var compatible = require('../../../../core/navigator/compatible.js');
    var Template = require('../../../../libs/template.js');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var tpl = new Template(template);

    var donkeyIndex = 0;
    var namespace = 'donkey-ui-editor_action-image';
    var RE_IMG_TYPE = /^image\//;
    /**
     * @property createObjectURL {Function}
     * @type {Object}
     */
    var URL = compatible.html5('URL', w);
    var defaults = {
        width: 500,
        title: '图片',
        fileName: 'file',
        buttons: [{
            text: '确定'
        }, {
            text: '取消'
        }]
    };

    var Image = ui.create({
        constructor: function (editor, options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the.editor = editor;
            the._initNode();
            the._initEvent();
        },


        _initNode: function () {
            var the = this;
            var options = the._options;

            the._id = donkeyIndex++;
            the._dialog = new Dialog({
                width: options.width,
                title: options.title,
                template: tpl.render({
                    id: the._id,
                    fileName: options.fileName
                }),
                buttons: options.buttons
            });
            the._eDialog = the._dialog.getNode();
            var nodes = selector.query('.j-flag', the._eDialog);
            the._eTab = nodes[0];
            the._eFile = nodes[1];
            the._eUrl = nodes[2];
            the._eTitle = nodes[3];
            the._tab = new Tab(the._eTab);
            attribute.addClass(the._eFile, the._fileClass = namespace + '-file-' + the._id);
        },


        _initEvent: function () {
            var the = this;
            var canListenDragAndDropAndPaste = false;
            var eDialog = the._eDialog;
            var eEditor = the._eEditor = the.editor.getNode();
            var eMask = the._eDialogMask = the._dialog.getMask().getNode();
            var onUploadSuccess = function (url) {
                if (url) {
                    the.editor.insert('image', {
                        src: url
                    });
                    the.reset();
                }

                the._dialog.close();
            };

            /**
             * 解析事件对象并上传
             * @param eve
             */
            var parseEventAndUpload = function (eve) {
                var files = eventParser.parseFiles(eve, this);

                if (files.length) {
                    eve.preventDefault();
                    the.editor.emit('upload', eve, files[0], onUploadSuccess);
                }
            };

            event.on(eDialog, 'change', '.' + the._fileClass, the._onchange = parseEventAndUpload);

            the._dialog
                .before('open', function () {
                    canListenDragAndDropAndPaste = true;
                })
                .on('close', function () {
                    canListenDragAndDropAndPaste = false;
                })
                .on('action', function (index) {
                    switch (index) {
                        case 0:
                            var url = the._eUrl.value;

                            if (url) {
                                the.editor.insert('image', {
                                    src: url
                                });
                                the.reset();
                            }
                            break;
                    }

                    the._dialog.close();
                });

            event.on(d, 'dragenter dragover', the._ondrag = function () {
                return false;
            });

            event.on(eMask, 'drop', parseEventAndUpload);
            //event.on(eDialog, 'drop', parseEventAndUpload);
            event.on(eEditor, 'drop', parseEventAndUpload);
            event.on(eMask, 'paste', parseEventAndUpload);
            //event.on(eDialog, 'paste', parseEventAndUpload);
            event.on(eEditor, 'paste', parseEventAndUpload);
        },


        /**
         * 重置
         * @returns {Image}
         */
        reset: function () {
            var the = this;

            the._eUrl.value = '';
            the._eTitle.value = '';
            the._eFile = modification.replace(the._eFile, 'input', {
                type: 'file',
                name: the._options.fileName,
                'class': the._fileClass
            });

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            event.un(d, 'dragenter dragover', the._ondrag);
            event.un(the._eDialog, 'change drop paste', the._onchange);
            event.un(the._eEditor, 'drop paste', the._onchange);
            the._dialog.destroy();
        }
    });

    ui.importStyle(style);
    klass.transfer(Dialog, Image, '_dialog');
    klass.transfer(Dialog.super_, Image, '_dialog');
    Image.defaults = defaults;
    module.exports = Image;
});