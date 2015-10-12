/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-10-10 14:09
 */


define(function (require, exports, module) {
    'use strict';

    var SPA = require('../../src/libs/spa.js');
    var spa = new SPA();

    spa
        .if('/page1/', function (ready) {
            require.async('./pages/page1.js', ready);
        })
        .if('/page2/:pageId/', function (ready) {
            require.async('./pages/page2.js', ready);
        })
        .if(/^\/page3\/(\d+)\/$/, function (ready) {
            require.async('./pages/page3.js', ready);
        })
        .else(function (ready) {
            require.async('./pages/404.js', ready);
        })
        .before('enter', function (route) {
            console.log(route);
        })
        .after('enter', function (route) {
            console.log(route);
        });

    document.getElementById('btn1').onclick = function () {
        spa.redirect('/page1/', true);
    };

    document.getElementById('btn2').onclick = function () {
        spa.redirect('/page1/', false);
    };
});