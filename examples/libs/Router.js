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
        .if('/', function (params, msgs) {
            console.log('主页');

            // 接收到消息
            console.log(msgs);
        })
        .if('/list/', function () {
            console.log('列表第1页');

            // send(路由名, 事件名, 消息内容)
            this.send('/', 'name1', 'hehe1');
            this.send('/', 'name2', 'hehe2');
            this.send('/', 'name2', 'hehe3');
        })
        .if('/list/page/:page/', function (params) {
            console.log('列表第' + params.page + '页');
        })
        .if('/detail/:id', function (params) {
            console.log('详情' + params.id + '页');
        })
        .else(function () {
            console.log('无匹配路由');
        })
        .on('enter', function (route, lastRoute) {
            console.log('enter 事件 => 离开：', lastRoute, '进入：', route);
        })
        .on('leave', function (route, nextRoute) {
            console.log('leave 事件 => 离开：' + route, '进入：', nextRoute);
        });

    document.getElementById('red').onclick = function () {
        router.redirect('/' + Math.random());
    };
});