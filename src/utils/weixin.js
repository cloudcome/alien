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

            config.timestamp = config.timestamp || config.timeStamp;
            dato.extend(the._config, {
                jsApiList: jsApiList,
                debug: !!DEBUG
            }, config);
            wx.config(the._config);

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
            var shareData = dato.extend(the._shareData, callbacks);
            var WeixinJSBridge = window[namespace];
            var readyTodo = function () {
                the._hasReady = true;
                dato.each(the._readyCallbacks, function (index, callback) {
                    callback();
                });

                the.emit('ready');
            };

            // 新接口
            wx.ready(function () {
                //// 分享到朋友圈
                //wx.onMenuShareTimeline(shareData);
                //
                //// 分享给好友
                //wx.onMenuShareAppMessage(shareData);
                //
                //// 分享到 QQ
                //wx.onMenuShareQQ(shareData);
                //
                //// 分享到腾讯微博
                //wx.onMenuShareWeibo(shareData);

                readyTodo();
            });

            wx.error(function (res) {
                dato.each(the._brokenCallbacks, function (index, callback) {
                    callback(res);
                });
                the.emit('error', res);
            });

            // 旧接口
            document.addEventListener('WeixinJSBridgeReady', function () {
                if (!WeixinJSBridge) {
                    return;
                }

                readyTodo();


                //绑定‘分享到微博’按钮
                WeixinJSBridge.on('menu:share:weibo', function (argv) {
                    WeixinJSBridge.invoke('shareWeibo', {
                        content: shareData.desc,
                        url: shareData.link
                    }, function (res) {
                        the.emit('complete', res);
                    });
                });
            });
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
                    WeixinJSBridge.on('menu:share:timeline', function (argv) {
                        WeixinJSBridge.invoke('shareTimeline', {
                            img_url: shareData.imgUrl,
                            link: shareData.link,
                            desc: shareData.desc,
                            title: shareData.title
                        }, function (res) {
                            the.emit('complete', res);
                        });
                    });
                }
            } catch (err) {
                // ignore
            }

            wx.onMenuShareTimeline({
                title: shareData.title, // 分享标题
                link: shareData.link, // 分享链接
                imgUrl: shareData.img, // 分享图标
                success: callback,
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });

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
                        }, callback);
                    });
                }
            } catch (err) {
                // ignore
            }

            wx.onMenuShareTimeline({
                title: shareData.title, // 分享标题
                desc: shareData.desc, // 分享描述
                link: shareData.link, // 分享链接
                imgUrl: shareData.img, // 分享图标
                type: '', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: callback,
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });

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
                success: callback,
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
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
                success: callback,
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
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

            wx.onMenuShareWeibo({
                title: shareData.title, // 分享标题
                desc: shareData.desc, // 分享描述
                link: shareData.link, // 分享链接
                imgUrl: shareData.img, // 分享图标
                success: callback,
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });


            return the;
        }
    });

    var weixin = new Weixin();

    weixin.original = wx;
    module.exports = weixin;
});