define(function (require) {
    'use strict';

    var hashbang = require('/src/core/navigator/hashbang.js');
    var dato = require('/src/util/dato.js');
    var random = require('../../../src/util/random.js');
    var $routers = document.getElementById('routers');
    var $ret = document.getElementById('ret');
    var routes = [{
        router: '/index/',
        callback: function (matched) {
            $ret.innerHTML = 'matched /index/';
        }
    }, {
        router: '/user/:userId/',
        callback: function (matched) {
            $ret.innerHTML = 'matched /user/:userId/, userId = ' + matched.userId;
        }
    }, {
        router: '/admin/:adminId/page/:pageNo/',
        callback: function (matched) {
            $ret.innerHTML = 'matched /user/:userId/, adminId = ' + matched.adminId + '; pageNo = ' + matched.pageNo;
        }
    }, {
        router: '*',
        callback: function () {
            $ret.innerHTML = 'matched null, return to /index/';
            hashbang.set('path', ['index']);
        }
    }];

    var lis = '';
    dato.each(routes, function (index, config) {
        lis += '<li>路由' + (index + 1) + '：' + config.router + '</li>';
    });
    $routers.innerHTML = lis;

    document.getElementById('btn1').onclick = function () {
        hashbang.set('path', ['index']);
    };

    document.getElementById('btn2').onclick = function () {
        hashbang.set('path', ['user', random.number(1, 9999)]);
    };

    document.getElementById('btn3').onclick = function () {
        hashbang.set('path', ['admin', random.number(1, 9999), 'page', random.number(1, 9999)]);
    };

    document.getElementById('btn4').onclick = function () {
        hashbang.set('path', [random.string(10, 'aA0!')]);
    };

    hashbang.routers(routes);
});