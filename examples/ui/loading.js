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
            modal: true,
            style: {
                size: 200
            }
        });

        ld.open();
    };
});