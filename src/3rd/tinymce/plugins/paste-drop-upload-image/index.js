/**
 * 粘贴、拖拽图片上传
 * @author ydr.me
 * @create 2016-02-02 11:47
 */


define(function (require, exports, module) {
    'use strict';

    var PluginManager = require("../../classes/AddOnManager").PluginManager;
    var event = require('../../../../utils/event.js');
    var typeis = require('../../../../utils/typeis.js');

    PluginManager.add('paste-drop-upload-image', function (editor) {
        var self = this;
        var settings = editor.settings;
        var resolve = function (img) {
            if (typeis.String(img)) {
                img = {
                    src: img
                };
            }

            img.src = img.src || img.url;
            editor.undoManager.transact(function () {
                img.id = '__mcenew';
                editor.selection.setContent(editor.dom.createHTML('img', img));
                var imgElm = editor.dom.get(img.id);
                editor.dom.setAttrib(imgElm, 'id', null);
                editor.selection.select(imgElm);
                editor.nodeChanged();
            });
        };

        editor.on('dragenter dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        editor.on('paste drop', function (eve) {
            var imgs = event.parseFiles(eve, this.getDoc());

            if (!imgs.length) {
                return;
            }

            editor.fire('upload', [eve, imgs, resolve]);
        });
    });
});