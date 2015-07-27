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
        var ld = new Loading(window, {
            isModal: true,
            style: {
                size: 100
            }
        });

        ld.open();
    };

    document.getElementById('btn2').onclick = function () {
        var ld = new Loading(window, {
            isModal: false,
            text: '请稍后'
        });

        ld.open();
    };

    var ld3;
    document.getElementById('btn3').onclick = function () {
        ld3 = new Loading('#demo', {
            text: ''
        });

        ld3.open();
    };
    document.getElementById('btn4').onclick = function () {
        if (ld3) {
            ld3.done();
            ld3 = null;
        }
    };
});