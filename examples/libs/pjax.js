/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-15 14:44
 */


define(function (require) {
    'use strict';

    var Pjax = require('/src/libs/pjax.js');
    var $btn = document.getElementById('btn');
    var $status = document.getElementById('status');
    var $container = document.getElementById('container');
    var pjax = new Pjax('#container', {
        cacheExpires: 10000
    });
    var _html = function (isSuccess) {
        var date = new Date();
        return '<h2>' + (isSuccess ? 'success' : 'error') + ' ' +
            date.toLocaleString() + ':' + date.getMilliseconds() +
            '</h2>' +
            '<p>' + this.url + '</p>' +
            '<p>' + JSON.stringify(this.state) + '</p>';
    };
    var num = 1;

    pjax.on('beforechange', function () {
        $status.innerHTML = (this.inCache ? 'cache' : 'ajax') + ' loading....';
    });

    pjax.on('afterchange', function () {
        $status.innerHTML = (this.inCache ? 'cache' : 'ajax') + ' done';
    });

    pjax.on('success', function (html) {
        console.log(this);
    });

    pjax.on('error', function () {
    });


    // 主动跳转
    $btn.onclick = function () {
        var url = '/examples/libs/' + num + '.html';

        num = num === 1 ? 2: 1;

        pjax.redirect(url, {
            data: url
        });
    };
});