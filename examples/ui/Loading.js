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

    var Loading = require('../../src/ui/Loading/');

    //document.getElementById('btn1').onclick = function () {
    //    var ld = new Loading(window, {
    //        isModal: true
    //    });
    //};

    //document.getElementById('btn2').onclick = function () {
    //    var ld = new Loading(window, {
    //        isModal: false,
    //        text: '请稍后'
    //    });
    //};

    var ld3;
    document.getElementById('btn3').onclick = function () {
        ld3 = new Loading('#demo', {
            text: ''
        });
    };
});