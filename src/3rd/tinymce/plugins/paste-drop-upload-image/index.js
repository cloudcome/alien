/**
 * 文件描述
 * @author ydr.me
 * @create 2016-02-02 11:47
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var PluginManager = require("../../classes/AddOnManager").PluginManager;

    PluginManager.add('paste-drop-upload-image', function (editor) {
        var self = this, settings = editor.settings;

        editor.on('dragenter dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        editor.on('paste', function () {

        });

        editor.on('drop', function () {

        });
    });
});