/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-12-17 22:13
 */


define(function (require, exports, module) {
    'use strict';

    var Touchpull = require('/src/ui/Touchpull/');
    var tp = new Touchpull('body', '#demo');

    tp.on('pulldown', function () {
        console.log(this.alienEvent.type);
    });

    tp.on('pullup', function () {
        console.log(this.alienEvent.type);
    });
});