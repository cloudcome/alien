/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-10-10 14:09
 */


define(function (require, exports, module) {
    'use strict';

    var SPA = require('../../src/ui/spa/index.js');
    var spa = new SPA('#view');

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
        .before('leave', function (lastRoute, params, query) {
            console.log(this.alienEmitter.type, arguments);
        })
        .after('leave', function (lastRoute, params, query) {
            console.log(this.alienEmitter.type, route);
        })
        .before('enter', function (route) {
            console.log(this.alienEmitter.type, route);
        })
        .after('enter', function (params, query) {
            console.log(this.alienEmitter.type, params);
        })
        .before('update', function (params, query) {
            console.log(this.alienEmitter.type, params);
        })
        .after('update', function (route) {
            console.log(this.alienEmitter.type, route);
        });

    document.getElementById('btn1').onclick = function () {
        spa.redirect('/page2/' + Date.now() + '/?c=' + Date.now(), true);
    };

    document.getElementById('btn2').onclick = function () {
        spa.redirect('/page2/' + Date.now() + '?c=' + Date.now(), false);
    };
});