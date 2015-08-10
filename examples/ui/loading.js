/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-06 14:19
 */


define(function (require, exports, module) {
    /**
     * @module parent/alert
     */
    'use strict';

    var Loading = require('../../src/ui/loading/');

    document.getElementById('btn1').onclick = function () {
        var ld = new Loading({
            modal: true,
            text: '正在玩命的加载中'
        });

        ld.open();
    };

    document.getElementById('btn2').onclick = function () {
        var ld = new Loading({
            modal: false,
            text: null
        });

        ld.open();
    };
});