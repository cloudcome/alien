/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-12-17 22:13
 */


define(function (require, exports, module) {
    'use strict';

    var Mask = require('/src/ui/Window/');
    var win1 = new Mask('#demo', {
        addClass: 'mask'
    });

    document.getElementById('btn1').onclick = function () {
        win1.open();
    };

    document.getElementById('btn2').onclick = function () {
        win1.close();
    };
});