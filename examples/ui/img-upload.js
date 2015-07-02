/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-06 19:41
 */


define(function (require, exports, module) {
    'use strict';

    var Upload = require('../../src/ui/img-upload/index.js');
    var upload = new Upload({
        ajax: {
            timeout: 400
        }
    });

    document.getElementById('btn1').onclick = function () {
        upload.setOptions({
            isClip: true
        }).open();
    };

    document.getElementById('btn2').onclick = function () {
        upload.setOptions({
            isClip: false
        }).open();
    };
});