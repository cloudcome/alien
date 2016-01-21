/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-10-10 14:09
 */


define(function (require, exports, module) {
    'use strict';

    var SPA = require('../../src/ui/spa/index.js');
    var selector = require('../../src/core/dom/selector.js');
    var attribute = require('../../src/core/dom/attribute.js');
    var spa = new SPA('#view');

    var $loading = selector.query('#loading')[0];

    spa
        .if('/page1/', function (ready) {
            require.async('./pages/page1.js', ready);
        })
        .if('/page2/:pageId/', function (ready) {
            require.async('./pages/page1.js');
            require.async('./pages/page3.js');
            require.async('./pages/page2.js', ready);
        })
        .if(/^\/page3\/(\d+)\/$/, function (ready) {
            require.async('./pages/page3.js', ready);
        })
        .else(function (ready) {
            require.async('./pages/404.js', ready);
        })
        .before('loading', function () {
            attribute.show($loading);
        })
        .after('loading', function () {
            attribute.hide($loading);
        });

    document.getElementById('btn1').onclick = function () {
        spa.redirect('/page2/' + Date.now() + '/?c=' + Date.now(), true);
    };

    document.getElementById('btn2').onclick = function () {
        spa.redirect('/page2/' + Date.now() + '?c=' + Date.now(), false);
    };

    attribute.hide($loading);
});