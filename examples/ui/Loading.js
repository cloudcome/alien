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

    document.getElementById('btn1').onclick = function () {
        var ld = new Loading({
            isModal: true
        });

        //setTimeout(function () {
        //    ld.done();
        //}, 5000);
    };

    document.getElementById('btn2').onclick = function () {
        var ld = new Loading({
            isModal: false,
            text: '请稍后'
        });

        //setTimeout(function () {
        //    ld.done();
        //}, 5000);
    };
});