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
    var string = require('./string.js');
    var controller = require('./controller.js');
    var Emitter = require('../libs/emitter.js');

    var jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'translateVoice', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'];
    var namespace = 'WeixinJSBridge';
    // Mozilla/5.0 (iPhone; CPU iPhone OS 9_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13C75
    // MicroMessenger/6.3.8 NetType/WIFI Language/zh_CN
    var ua = navigator.userAgent;
    var parseUA = function (type) {
        var reg = new RegExp(string.escapeRegExp(type) + '\/([^ ]*)', 'i');

        return ua.match(reg) || ['', ''];
    };
    var uaMicroMessenger = parseUA('MicroMessenger');
    var uaNetType = parseUA('NetType');
    var uaLanguage = parseUA('Language');
    var Weixin = klass.extends(Emitter).create({
        constructor: function () {
            var the = this;

            the.className = 'weixin';
            the._readyCallbacks = [];
            the._brokenCallbacks = [];
            the._configs = {};
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
            dato.extend(the._configs, {
                jsApiList: jsApiList,
                debug: !!DEBUG
            }, config);
            wx.config(the._configs);

            // 新接口
            wx.ready(the._onready.bind(the));
            wx.error(the._onbroken.bind(the));

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

                if (!res.errMsg || /:\s*?ok$/i.test(res.errMsg)) {
                    return callback();
                }

                callback(new Error(res.errMsg));
            };
        },


        /**
         * 准备完回调
         * @returns {*}
         * @private
         */
        _onready: function () {
            var the = this;

            // 非微信直接到 error
            if (!uaMicroMessenger[0]) {
                return the._onbroken();
            }

            if (the._hasReady || the._hasBroken) {
                return;
            }

            var shareData = the._shareData;
            var WeixinJSBridge = window[namespace];
            var callback = function (err) {
                if (err) {
                    the.emit('error', err);
                    return;
                }

                the.emit('success');
            };

            shareData.appId = the._configs.appId;
            shareData.img_url = shareData.imgUrl = shareData.img;
            shareData.content = shareData.desc;
            shareData.complete = the._callback(callback);


            // 分享到朋友圈
            try {
                wx.onMenuShareTimeline(shareData);
            } catch (err) {
                try {
                    WeixinJSBridge.on('menu:share:timeline', function () {
                        WeixinJSBridge.invoke('shareTimeline', shareData, the._callback(callback));
                    });
                } catch (err) {
                    // ignore
                }
            }


            // 分享给好友
            try {
                wx.onMenuShareAppMessage(shareData);
            } catch (err) {
                try {
                    WeixinJSBridge.on('menu:share:appmessage', function () {
                        WeixinJSBridge.invoke('sendAppMessage', shareData, the._callback(callback));
                    });
                } catch (err) {
                    // ignore
                }
            }


            // 分享到 QQ 好友
            try {
                wx.onMenuShareQQ(shareData);
            } catch (err) {
                // ignore
            }


            // 分享到 QQ 空间
            try {
                wx.onMenuShareQZone(shareData);
            } catch (err) {
                // ignore
            }


            // 分享到腾讯微博
            try {
                wx.onMenuShareWeibo(shareData);
            } catch (err) {
                try {
                    WeixinJSBridge.on('menu:share:weibo', function (argv) {
                        WeixinJSBridge.invoke('shareWeibo', shareData, the._callback(callback));
                    });
                } catch (err) {
                    // ignore
                }
            }

            the._hasReady = true;
            controller.nextTick(function () {
                dato.each(the._readyCallbacks, function (index, callback) {
                    callback();
                });
                the.emit('ready');
            });
        },


        /**
         * 失败后回调
         * @private
         */
        _onbroken: function () {
            var the = this;

            if (the._hasReady || the._hasBroken) {
                return;
            }

            the._hasBroken = true;
            controller.nextTick(function () {
                dato.each(the._brokenCallbacks, function (index, callback) {
                    callback();
                });
                the.emit('error');
            });
        },

        _initEvent: function () {
            var the = this;

            // 旧接口
            document.addEventListener('WeixinJSBridgeReady', the._onready.bind(the));
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
         * 判断是否支持某个 API
         * @param api {String} api 名称
         * @param callback {Function} 回调
         * @returns {Weixin}
         */
        support: function (api, callback) {
            var the = this;

            try {
                wx.checkJsApi({
                    jsApiList: [api],
                    complete: the._callback(function (err) {
                        callback(!err);
                    })
                });
            } catch (err) {
                controller.nextTick(function () {
                    callback(false);
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
            var WeixinJSBridge = window[namespace];

            signature.appId = the._configs.appId;
            signature.timeStamp = signature.timestamp = signature.timestamp || signature.timeStamp;
            signature.signType = signature.signType || 'MD5';

            the.support('chooseWXPay', function (support) {
                if (!support) {
                    return callback(new Error('当前微信客户端不支持微信支付，请升级微信到最新版本再试一次'));
                }

                try {
                    signature.complete = the._callback(callback);
                    wx.chooseWXPay(signature);
                } catch (err) {
                    try {
                        WeixinJSBridge.invoke('getBrandWCPayRequest', signature, the._callback(callback));
                    } catch (err) {
                        callback(new Error('微信客户端错误'));
                    }
                }
            });

            return the;
        }
    });

    var weixin = new Weixin();

    weixin.wx = wx;
    weixin.is = !!uaMicroMessenger[0];
    weixin.version = uaMicroMessenger[1] || '0.0.0';
    weixin.netWork = uaNetType[1];
    weixin.language = uaLanguage[1];
    module.exports = weixin;
});