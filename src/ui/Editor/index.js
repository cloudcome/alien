/*!
 * 新版 markdown 编辑器
 * @author ydr.me
 * @create 2015-04-03 02:32:10
 */


define(function (require, exports, module) {
    'use strict';

    var gfm = require('../../3rd/codemirror/mode/gfm.js');
    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var Editor = ui.create(function ($editor) {
        var the = this;

        the._editor = gfm.fromTextArea(selector.query($editor)[0], {
            mode: 'gfm',
            lineNumbers: true,
            theme: "monokai",
            autoCloseBrackets: true,
            autoCloseTags: true,
            autofocus: true,
            dragDrop: false,
            indentUnit: 4,
            indentWithTabs: true,
            lineWrapping: true,
            matchBrackets: true,
            readOnly: false,
            showTrailingSpace: true,
            styleActiveLine: true,
            styleSelectedText: true,
            tabSize: 4
        });
        the._initEvent();
    });


    Editor.fn._initEvent = function () {
        var the = this;

        the._editor.addKeyMap({
            'Cmd-B': function () {
                var raw = the._editor.getSelection();

                if(raw){
                    the._editor.replaceSelection('**' + raw + '**');
                }
            },
            'Cmd-I': function () {
                var raw = the._editor.getSelection();

                if(raw){
                    the._editor.replaceSelection('*' + raw + '*');
                }
            }
        });
    };

    Editor.fn.getValue = function () {
        return this._editor.getValue();
    };


    module.exports = Editor;
});
