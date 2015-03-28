define(function (require) {
    'use strict';

    var hashbang = require('/src/core/navigator/hashbang.js');
    var dato = require('/src/utils/dato.js');
    var random = require('../../../src/utils/random.js');
    var $ret = document.getElementById('ret');
    var routes = [{
        '/index/': function (matched) {
            $ret.innerHTML = 'matched /index/';
        }
    }, {
        '/user/:userId/': [function (matched) {
            $ret.innerHTML = 'matched /user/:userId/, userId = ' + matched.userId;
        }, function (matched) {
            console.log(matched);
        }]
    }, {
        '/admin/:adminId/page/:pageNo/': function (matched) {
            $ret.innerHTML = 'matched /user/:userId/, adminId = ' + matched.adminId + '; pageNo = ' + matched.pageNo;
        }
    }, {
        '*': function () {
            $ret.innerHTML = 'matched null, return to /index/';
            hashbang.set('path', ['index']);
        }
    }];

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