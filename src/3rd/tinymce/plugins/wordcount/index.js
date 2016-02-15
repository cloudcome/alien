define(function (require) {
    /*@polyfill string.js*/

    'use strict';

    var tinymce = window.tinymce;
    var PluginManager = require("../../classes/AddOnManager").PluginManager;
    var controller = require('../../../../utils/controller.js');

    /**
     * plugin.js
     *
     * Released under LGPL License.
     * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
     *
     * License: http://www.tinymce.com/license
     * Contributing: http://www.tinymce.com/contributing
     */

    /*global tinymce:true */

    PluginManager.add('wordcount', function (editor) {
        var self = this, countre, cleanre;

        // Included most unicode blocks see: http://en.wikipedia.org/wiki/Unicode_block
        // Latin-1_Supplement letters, a-z, u2019 == &rsquo;
        countre = editor.getParam('wordcount_countregex', /[\w\u2019\x27\-\u00C0-\u1FFF]+/g);
        //cleanre = editor.getParam('wordcount_cleanregex', /[0-9.(),;:!?%#$?\x27\x22_+=\\\/\-]*/g);

        function update() {
            if (editor.destroyed) {
                return;
            }

            editor.theme.panel.find('#wordcount').text(['Words: {0}', self.getCount()]);
        }

        editor.on('init', function () {
            var statusbar = editor.theme.panel && editor.theme.panel.find('#statusbar')[0];

            if (statusbar) {
                tinymce.util.Delay.setEditorTimeout(editor, function () {
                    statusbar.insert({
                        type: 'label',
                        name: 'wordcount',
                        text: ['Words: {0}', self.getCount()],
                        classes: 'wordcount',
                        disabled: editor.settings.readonly
                    }, 0);

                    editor.on('change keyup', controller.debounce(update));

                    //editor.on('keyup', function (e) {
                    //    if (e.keyCode == 32) {
                    //        update();
                    //    }
                    //});
                }, 0);
            }
        });

        self.getCount = function () {
            var tx = editor.isDirty() ? editor.getContent({format: 'text'}) : '';
            var tc = 0;

            if (tx) {
                tx = tx
                // remove html tags and space chars
                    .replace(/&nbsp;|&#160;/gi, ' ')
                    // deal with html entities
                    .replace(/(\w+)(&#?[a-z0-9]+;)+(\w+)/i, "$1$3").replace(/&.+?;/g, ' ')
                    // remove space
                    .replace(/\s/g, '').trim();

                tc = tx.length;
            }

            return tc;
        };
    });
});