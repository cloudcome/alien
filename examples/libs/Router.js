/*!
 * Router
 * @author ydr.me
 * @create 2014-11-21 14:25
 */


define(function (require) {
    'use strict';

    var console = window.console;
    var Router = require('/src/libs/Router.js');
    var router = new Router();

    router
        .if('/', function () {
            console.log('主页');
        })
        .if('/list/', function () {
            console.log('列表第1页');
        })
        .if('/list/page/:page/', function (params) {
            console.log('列表第' + params.page + '页');
        })
        .if('/detail/:id', function (params) {
            console.log('详情' + params.id + '页');
        })
        .else(function () {
            router.redirect('/');
        })
        .on('enter', function (route) {
            console.log('进入：' + route);
        })
        .on('leave', function (route) {
            console.log('离开：' + route);
        });

    document.getElementById('red').onclick = function () {
        router.redirect('/' + Math.random());
    };
});