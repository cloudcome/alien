/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-15 15:33
 */


define(function (require, exports, module) {
    /**
     * @module parent/Slidebar
     */

    'use strict';

    var Popup = require('../../src/ui/Popup/');
    var $btn = document.getElementById('btn');
    var pp = new Popup($btn);

    pp.setContent('<input type="text">');

    $btn.onclick = function () {
        pp.open();
    };
});