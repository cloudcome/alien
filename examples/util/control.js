/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-12-20 16:50
 */


define(function (require, exports, module) {
    'use strict';

    var control = require('/src/util/control.js');

    window.onscroll = control.debounce(function () {
        console.log('onsrcoll', Date.now());
    }, 1000);
});