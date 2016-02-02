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

        // 载入内容之后，判断是否内容，没有的话显示占位
        editor.on('loadcontent', function (eve) {
            canPlaceholder = !eve.content && settings.placeholder

            if (canPlaceholder) {
                editor.setContent(settings.placeholder);
                editor.setDirty(false);
                editor.startContent = '';
            }
        });

        // 第一次聚焦的时候设置为空
        editor.once('focus', function () {
            if (canPlaceholder) {
                editor.setContent('');
                editor.setDirty(false);
            }
        });

        // 销毁实例前保存内容，如果内容没有变化则设置为空
        editor.once('SaveContent', function (eve) {
            if (eve.destroy && canPlaceholder && !editor.isDirty()) {
                eve.content = '';
            }
        });
    });
});