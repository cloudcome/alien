/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-04 21:45
 */


define(function (require, exports, module) {
    'use strict';

    var Imgview = require('/src/ui/Imgview/');
    var imgview = new Imgview();

    document.getElementById('img').onclick = function () {
        imgview.open([this.src]);
    };
});