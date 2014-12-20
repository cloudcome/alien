/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-12-20 16:50
 */


define(function (require, exports, module) {
    'use strict';

    var control = require('/src/util/control.js');

    window.addEventListener('scroll', control.throttle(function () {
        console.log('throttle onsrcoll', Date.now());
    }, 1000));

    window.addEventListener('scroll', control.debounce(function () {
        console.log('debounce onsrcoll', Date.now());
    }, 1000));

    document.addEventListener('click', control.once(function () {
        alert('I am once');
    }));

    document.addEventListener('click', control.toggle(function () {
        alert('呵呵');
    }, function () {
        alert('哈哈');
    }, function () {
        alert('嘿嘿');
    }));
});