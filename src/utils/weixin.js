/**
 * weixin JS SDK
 * @author ydr.me
 * @create 2015-12-15 10:40
 */


define(function (require, exports, module) {
    /**
     * @module utils/weixin
     */

    'use strict';

    var wx = require('../3rd/weixin.js');
    var klass = require('./class.js');
    var dato = require('./dato.js');
    var typeis = require('./typeis.js');
    var controller = require('./controller.js');
    var Emitter = require('../libs/emitter.js');

    var jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'translateVoice', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'];
    var namespace = 'WeixinJSBridge';

    var Weixin = klass.extends(Emitter).create({
        constructor: function () {
            var the = this;

            the.className = 'weixin';
            the._readyCallbacks = [];
            the._brokenCallbacks = [];
            the._config = {};
            the._shareData = {};
            the._hasReady = false;
            the._initEvent();
        },


        /**
         * @param config {Object}
         * @param config.debug {Boolean} 是否开启调试模式
         * @param config.appId {String} appId
         * @param config.timestamp {Number} 签名的时间戳
         * @param config.nonceStr {String} 生成签名的随机串
         * @param config.signature {String} 签名
         * @param [config.jsApiList] {Array} 需要使用的JS接口列表
         * @returns {Weixin}
         */
        config: function (config) {
            var the = this;

            config.appId = config.appId || config.appid;
            config.timestamp = config.timestamp || config.timeStamp;
            dato.extend(the._config, {
                jsApiList: jsApiList,
                debug: !!DEBUG
            }, config);
            wx.config(the._config);

            // 新接口
            wx.ready(the._ready.bind(the));

            wx.error(function (res) {
                if (the._hasReady || the._hasBroken) {
                    return;
                }

                the._hasBroken = true;
                controller.nextTick(function () {
                    dato.each(the._brokenCallbacks, function (index, callback) {
                        callback(res);
                    });
                    the.emit('error', res);
                });
            });

            return the;
        },


        /**
         * 设置分享数据
         * @param shareData {Object}
         * @param shareData.title {String} 分享的标题
         * @param shareData.desc {String} 分享的描述
         * @param shareData.link {String} 分享的链接
         * @param shareData.img {String} 分享的图片
         * @returns {Weixin}
         */
        shareData: function (shareData) {
            var the = this;

            shareData.img = shareData.img || shareData.imgUrl;
            dato.extend(the._shareData, shareData);
            return the;
        },


        /**
         * callback 封装
         * @param callback
         * @returns {*}
         * @private
         */
        _callback: function (callback) {
            return function (res) {
                if (!typeis.Function(callback)) {
                    return;
                }

                if (!res.errMsg || /:ok$/i.test(res.errMsg)) {
                    return callback();
                }

                callback(new Error(res.errMsg));
            };
        },

        _ready: function () {
            var the = this;

            if (the._hasReady || the._hasBroken) {
                return;
            }

            the._hasReady = true;
            controller.nextTick(function () {
                dato.each(the._readyCallbacks, function (index, callback) {
                    callback();
                });
                the.emit('ready');
            });
        },


        _initEvent: function () {
            var the = this;

            // 旧接口
            document.addEventListener('WeixinJSBridgeReady', the._ready.bind(the));
        },


        /**
         * 准备好后回调
         * @param [callback]
         * @returns {Weixin}
         */
        ready: function (callback) {
            var the = this;

            if (typeis.Function(callback)) {
                the._readyCallbacks.push(callback);
            }

            return the;
        },

        /**
         * 失败后回调
         * @param [callback]
         * @returns {Weixin}
         */
        broken: function (callback) {
            var the = this;

            if (typeis.Function(callback)) {
                the._brokenCallbacks.push(callback);
            }

            return the;
        },


        /**
         * 分享到朋友圈
         * @param callback
         * @returns {Weixin}
         */
        shareTimeline: function (callback) {
            var the = this;
            var shareData = the._shareData;
            var WeixinJSBridge = window[namespace];

            try {
                if (WeixinJSBridge) {
                    //绑定‘分享到朋友圈’按钮
                    WeixinJSBridge.on('menu:share:timeline', function () {
                        WeixinJSBridge.invoke('shareTimeline', {
                            img_url: shareData.imgUrl,
                            link: shareData.link,
                            desc: shareData.desc,
                            title: shareData.title
                        }, the._callback(callback));
                    });
                }
            } catch (err) {
                wx.onMenuShareTimeline({
                    title: shareData.title, // 分享标题
                    link: shareData.link, // 分享链接
                    imgUrl: shareData.img, // 分享图标
                    success: the._callback(callback),
                    cancel: the._callback(callback)
                });
            }

            return the;
        },


        /**
         * 分享给好友
         * @param [callback]
         * @returns {Weixin}
         */
        shareFriend: function (callback) {
            var the = this;
            var shareData = the._shareData;
            var WeixinJSBridge = window[namespace];

            try {
                if (WeixinJSBridge) {
                    //绑定‘分享给朋友’按钮
                    WeixinJSBridge.on('menu:share:appmessage', function (argv) {
                        WeixinJSBridge.invoke('sendAppMessage', {
                            appid: the._config.appId,
                            img_url: shareData.imgUrl,
                            link: shareData.link,
                            desc: shareData.desc,
                            title: shareData.title
                        }, the._callback(callback));
                    });
                }
            } catch (err) {
                wx.onMenuShareTimeline({
                    title: shareData.title, // 分享标题
                    desc: shareData.desc, // 分享描述
                    link: shareData.link, // 分享链接
                    imgUrl: shareData.img, // 分享图标
                    type: '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: the._callback(callback),
                    cancel: the._callback(callback)
                });
            }

            return the;
        },


        /**
         * 分享到QQ
         * @param [callback]
         * @returns {Weixin}
         */
        shareQQ: function (callback) {
            var the = this;
            var shareData = the._shareData;

            wx.onMenuShareQQ({
                title: shareData.title, // 分享标题
                desc: shareData.desc, // 分享描述
                link: shareData.link, // 分享链接
                imgUrl: shareData.img, // 分享图标
                success: the._callback(callback),
                cancel: the._callback(callback)
            });

            return the;
        },


        /**
         * 分享到QQ空间
         * @param [callback]
         * @returns {Weixin}
         */
        shareQZone: function (callback) {
            var the = this;
            var shareData = the._shareData;

            wx.onMenuShareQZone({
                title: shareData.title, // 分享标题
                desc: shareData.desc, // 分享描述
                link: shareData.link, // 分享链接
                imgUrl: shareData.img, // 分享图标
                success: the._callback(callback),
                cancel: the._callback(callback)
            });

            return the;
        },


        /**
         * 分享到QQ微博
         * @param [callback]
         * @returns {Weixin}
         */
        shareQQweibo: function (callback) {
            var the = this;
            var shareData = the._shareData;
            var WeixinJSBridge = window[namespace];

            try {
                if (WeixinJSBridge) {
                    //绑定‘分享到微博’按钮
                    WeixinJSBridge.on('menu:share:weibo', function (argv) {
                        WeixinJSBridge.invoke('shareWeibo', {
                            content: shareData.desc,
                            url: shareData.link
                        }, the._callback(callback));
                    });
                }
            } catch (err) {
                wx.onMenuShareWeibo({
                    title: shareData.title, // 分享标题
                    desc: shareData.desc, // 分享描述
                    link: shareData.link, // 分享链接
                    imgUrl: shareData.img, // 分享图标
                    success: the._callback(callback),
                    cancel: the._callback(callback)
                });
            }

            return the;
        },


        /**
         * 微信支付
         * @param signature {Object} 签名信息
         * @param signature.timestamp {Number} 支付签名时间戳
         * @param signature.nonceStr {String} 支付签名随机串，不长于 32 位
         * @param signature.package {String} 统一支付接口返回的prepay_id参数值
         * @param [signature.signType="MD5"] {String} 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
         * @param signature.paySign {String} 支付签名
         * @param [callback] {Function} 回调
         * @returns {Weixin}
         */
        pay: function (signature, callback) {
            var the = this;

            signature.success = the._callback(callback);
            signature.cancel = the._callback(callback);
            signature.timestamp = signature.timestamp || signature.timeStamp;
            signature.signType = signature.signType || 'MD5';
            wx.chooseWXPay(signature);

            return the;
        }
    });

    var weixin = new Weixin();

    weixin.wx = wx;
    module.exports = weixin;
});