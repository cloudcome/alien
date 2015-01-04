/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-04 21:45
 */


define(function (require, exports, module) {
    'use strict';

    var Imgview = require('/src/ui/Imgview/');
    var imgview = new Imgview();
    var list = [];

    list.push('http://dummyimage.com/600x400');
    list.push('http://dummyimage.com/1600x1400');
    list.push('http://dummyimage.com/600x1400');
    list.push('http://dummyimage.com/1600x400');

    document.getElementById('img').onclick = function () {
        imgview.open(list);
    };
});