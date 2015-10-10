/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-10-10 14:09
 */


define(function (require, exports, module) {
    /**
     * @module parent/spa
     */

    'use strict';

    var SPA = require('../../src/libs/spa.js');
    var spa = new SPA();

    spa
        .if('/page1/', function () {
            return require.async('./pages/page1.js');
        })
        .if('/page2/', function () {
            return require.async('./pages/page2.js');
        })
        .else(function () {
            return require.async('./pages/404.js');
        });
});