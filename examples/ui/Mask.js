/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-12-17 22:13
 */


define(function (require, exports, module) {
    'use strict';

    var Mask = require('/src/ui/Mask/');
    var mask1 = new Mask('#demo', {
        addClass: 'mask'
    });
    var mask2 = new Mask(window, {
        addClass: 'mask'
    });

    document.getElementById('btn1').onclick = function () {
        mask1.visible ? mask1.close() : mask1.open();
    };

    document.getElementById('btn2').onclick = function () {
        mask2.visible ? mask2.close() : mask2.open();
    };

    window.mask1 = mask1;
});