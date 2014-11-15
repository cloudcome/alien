/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-15 14:44
 */


define(function (require) {
    'use strict';

    var Pjax = require('/src/libs/Pjax.js');
    var random = require('/src/util/random.js');
    var $btn = document.getElementById('btn');
    var $container = document.getElementById('container');
    var pjax = new Pjax('#container');
    var _html = function (isSuccess) {
        var date = new Date();
        return '<h2>' + (isSuccess ? 'success' : 'error') + ' ' +
            date.toLocaleString() + ':' + date.getMilliseconds() +
            '</h2>' +
            '<p>' + this.url + '</p>' +
            '<p>' + JSON.stringify(this.state) + '</p>';
    };

    pjax.on('beforechange', function () {
        console.log('beforechange');
    });

    pjax.on('afterchange', function () {
        console.log('afterchange');
    });

    pjax.on('success', function () {
        $container.innerHTML = _html.call(this, true);
        return false;
    });

    pjax.on('error', function () {
        $container.innerHTML = _html.call(this, false);
        return false;
    });


    // 主动跳转
    $btn.onclick = function () {
        var url = location.pathname + '?s=' + random.string(10) + '#' + random.string(10);

        pjax.redirect(url, {
            data: url
        });
    };
});