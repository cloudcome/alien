define(function (require, exports, module) {
    'use strict';

    var Editor = require('../../src/ui/Editor/index.js');
    var xhr = require('../../src/core/communication/xhr.js');
    var editor = new Editor('#editor', {
        uploadCallback: function (list, progress, done) {
            var fd = new FormData();

            list.forEach(function (item) {
                fd.append('img[]', item.file);
            });

            xhr.get('./upload.json', fd).on('success', function (json) {
                setTimeout(function () {
                    done(null, json);
                }, 2000);
            }).on('error', function (err) {
                setTimeout(function () {
                    done(err);
                }, 2000);
            }).on('progress', function (eve) {
                progress(eve.alienDetail.percent);
            });
        }
    });
    

    //btn1.onclick = function () {
    //    editor.toggleFullscreen();
    //};
    //
    //btn2.onclick = function () {
    //    editor.toggleFullscreen();
    //};
});