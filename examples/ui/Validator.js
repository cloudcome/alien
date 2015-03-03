/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-16 14:41
 */


define(function (require, exports, module) {
    'use strict';

    var Validator = require('/src/ui/Validator/');
    var v1 = new Validator('#form');
    var $submit = document.getElementById('submit');

    v1.pushRule({
        name: 'username',
        function: function (val, next) {
            v1.emitMsg('username', '正在第1/2次异步验证……', 'warning');
            setTimeout(function () {
                next();
            }, 1000);
        }
    });

    v1.pushRule({
        name: 'username',
        function: function (val, next) {
            v1.emitMsg('username', '正在第2/2次异步验证……', 'warning');
            setTimeout(function () {
                next();
            }, 1000);
        }
    });

    v1.on('validateonebefore', function ($item) {
        console.log($item);
    });

    v1.on('validateallbefore', function ($form) {
        $submit.disabled = true;
    });

    v1.on('validateallafter', function ($form) {
        $submit.disabled = false;
    });
});