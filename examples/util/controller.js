/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-12-20 16:50
 */


define(function (require, exports, module) {
    'use strict';

    var controller = require('../../src/util/controller.js');

    window.addEventListener('scroll', controller.throttle(function () {
        console.log('throttle onsrcoll', Date.now());
    }, 1000));

    window.addEventListener('scroll', controller.debounce(function () {
        console.log('debounce onsrcoll', Date.now());
    }, 1000));

    document.addEventListener('click', controller.once(function () {
        alert('I am once');
    }));

    document.addEventListener('click', controller.toggle(function () {
        alert('呵呵');
    }, function () {
        alert('哈哈');
    }, function () {
        alert('嘿嘿');
    }));
});