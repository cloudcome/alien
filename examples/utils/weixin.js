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

    document.write(navigator.userAgent);
    document.write('<br>' + weixin.is);
    document.write('<br>' + weixin.version);
    document.write('<br>' + weixin.netWork);
    document.write('<br>' + weixin.language);

    weixin.config({
        appid: '123'
    }).ready(function () {
        alert('微信初始化成功');
        for (var key in window.WeixinJSBridge) {
            document.write('<br>' + key + ' = ' + window[key]);
        }
    }).broken(function () {
        alert('微信初始化失败');
    });

    //weixin.wx.ready(function () {
    //    alert('ready');
    //});
    //
    //weixin.wx.error(function () {
    //    alert('error');
    //});
});