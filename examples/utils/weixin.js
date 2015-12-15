/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-15 10:47
 */


define(function (require, exports, module) {
    /**
     * @module parent/weixin
     */

    'use strict';

    var weixin = require('../../src/utils/weixin.js');

    weixin.ready(function () {
        for (var key in window.WeixinJSBridge) {
            document.write('<br>' + key + ' = ' + window[key]);
        }
    }).broken(function () {
        alert('微信初始化失败');
    });
});