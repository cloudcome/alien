/**
 * 初始占位提示
 * @author ydr.me
 * @create 2016-02-02 15:03
 */


define(function (require, exports, module) {
    'use strict';

    var PluginManager = require("../../classes/AddOnManager").PluginManager;

    PluginManager.add('placeholder', function (editor) {
        var settings = editor.settings;
        var canPlaceholder = false;

        editor.on('loadcontent', function (eve) {
            canPlaceholder = !eve.content && settings.placeholder

            if (canPlaceholder) {
                editor.setContent(settings.placeholder);
                editor.setDirty(false);
            }
        });

        editor.once('focus', function () {
            if (canPlaceholder) {
                editor.setContent('');
                editor.setDirty(false);
            }
        });
    });
});