/*!
 * 微信
 * @author ydr.me
 * @create 2015-02-13 16:57
 */


define(function (require, exports, module) {
    /**
     * @module libs/weixin
     * @requires utils/class.js
     * @requires utils/dato.js
     * @requires libs/emitter
     */
    'use strict';

    var wx = require('../3rd/weixin.js');
    var klass = require('../utils/class.js');
    var dato = require('../utils/dato.js');
    var Emitter = require('./emitter.js');
    var jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'translateVoice', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'];


    /**
     * 配置微信 JS SDK
     * @param config {Object}
     * @param config.debug {Boolean} 是否开启调试模式
     * @param config.appId {String} appId
     * @param config.timestamp {Number} 签名的时间戳
     * @param config.nonceStr {String} 生成签名的随机串
     * @param config.signature {String} 签名
     * @param [config.jsApiList] {Array} 需要使用的JS接口列表
     * @param shareData {Object}
     * @param shareData.title {String} 分享的标题
     * @param shareData.desc {String} 分享的描述
     * @param shareData.link {String} 分享的链接
     * @param shareData.img {String} 分享的图片
     */
    module.exports = klass.extends(Emitter).create({
        constructor: function (config, shareData) {
            var the = this;

            the._config = dato.extend({
                jsApiList: jsApiList
            }, config);
            wx.config(the._config);
            the._shareData = shareData;
            the._init();
        },
        _init: function () {
            var the = this;

            the._initEvent();

            return the;
        },

        _initEvent: function () {
            var the = this;

            // success：接口调用成功时执行的回调函数。
            // fail：接口调用失败时执行的回调函数。
            // complete：接口调用完成时执行的回调函数，无论成功或失败都会执行。
            // cancel：用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到。
            // trigger: 监听Menu中的按钮点击时触发的方法，该方法仅支持Menu中的相关接口。
            var callbacks = {
                success: function (errMsg) {
                    the.emit('success', errMsg);
                },
                fail: function (errMsg) {
                    the.emit('error', errMsg);
                },
                complete: function (errMsg) {
                    the.emit('complete', errMsg);
                },
                cancel: function (errMsg) {
                    the.emit('cancel', errMsg);
                },
                trigger: function (errMsg) {
                    the.emit('trigger', errMsg);
                }
            };
            var shareData = dato.extend({}, the._shareData, callbacks);

            wx.ready(function () {
                the.emit('ready');

                // 分享到朋友圈
                wx.onMenuShareTimeline(shareData);

                // 分享给好友
                wx.onMenuShareAppMessage(shareData);

                // 分享到 QQ
                wx.onMenuShareQQ(shareData);

                // 分享到腾讯微博
                wx.onMenuShareWeibo(shareData);
            });

            wx.error(function (res) {
                the.emit('error', res);
            });

            // 旧接口
            document.addEventListener('WeixinJSBridgeReady', function () {
                var WeixinJSBridge = window.WeixinJSBridge;

                if (!WeixinJSBridge) {
                    return;
                }

                the.emit('ready');

                //绑定‘分享给朋友’按钮
                WeixinJSBridge.on('menu:share:appmessage', function (argv) {
                    WeixinJSBridge.invoke('sendAppMessage', {
                        "appid": the._config.appId,
                        "img_url": shareData.imgUrl,
                        "link": shareData.link,
                        "desc": shareData.desc,
                        "title": shareData.title
                    }, function (res) {
                        the.emit('complete', res);
                    });
                });

                //绑定‘分享到朋友圈’按钮
                WeixinJSBridge.on('menu:share:timeline', function (argv) {
                    WeixinJSBridge.invoke('shareTimeline', {
                        "img_url": shareData.imgUrl,
                        "link": shareData.link,
                        "desc": shareData.desc,
                        "title": shareData.title
                    }, function (res) {
                        the.emit('complete', res);
                    });
                });

                //绑定‘分享到微博’按钮
                WeixinJSBridge.on('menu:share:weibo', function (argv) {
                    WeixinJSBridge.invoke('shareWeibo', {
                        "content": shareData.desc,
                        "url": shareData.link
                    }, function (res) {
                        the.emit('complete', res);
                    });
                });
            });
        },

        wx: wx
    });
});