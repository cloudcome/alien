/*!
 * 荡客客户端与前端交互
 * 功能分为5部分
 * 1. 发送数据 send
 * 2. 分享 share
 * 3. 绑定 bind
 * 4. 地理位置 geolocation
 * 5. 导航栏 navigation
 *
 * @author ydr.me
 * @create 2015-03-10 17:29
 */


define(function (require, exports, module) {
    /**
     * @module libs/Dangke
     * @requires utils/class
     * @requires utils/controller
     * @requires utils/typeis
     * @requires utils/dato
     * @requires libs/Emitter
     */

    'use strict';

    var klass = require('../utils/class.js');
    var controller = require('../utils/controller.js');
    var typeis = require('../utils/typeis.js');
    var dato = require('../utils/dato.js');
    var Emitter = require('./Emitter.js');
    var noop = function () {
        // ignore
    };
    var Dangke = klass.create(function (shareData) {
        var the = this;

        the.shareData = shareData;
        the._init();
    }, Emitter);


    /**
     * 初始化
     * @private
     */
    Dangke.fn._init = function () {
        var the = this;

        the._initEvent();

        return the;
    };


    /**
     * 初始化事件
     * @returns {*}
     * @private
     */
    Dangke.fn._initEvent = function () {
        var the = this;
        var onready = function (bridge) {
            the.bridge = bridge;

            /**
             * jsbridge 准备完毕
             * @event ready
             * @param bridge {Object} jsbridge 对象
             */
            the.emit('ready', bridge);
        };

        if ('WebViewJavascriptBridge' in window) {
            return controller.nextTick(function () {
                onready(window.WebViewJavascriptBridge);
            });
        }

        document.addEventListener('WebViewJavascriptBridgeReady', function (eve) {
            try {
                eve.bridge.init();
            } catch (err) {
                // ignore
            }

            onready(eve.bridge);
        });
    };


    /**
     * 接收数据
     * @param res
     * @param callback
     * @param emitName
     * @private
     */
    Dangke.fn._onreceive = function (res, callback, emitName) {
        var the = this;
        var err = null;
        var data = res.data;

        // {code: 200, message: "", data: "..."}
        if (res.code !== 200) {
            err = new Error(res.message);
        }

        callback(err, data);

        /**
         * 调用事件
         */
        the.emit(emitName, err, data);
    };


    /**
     * 调用 webview 方法
     * @param name {String} 方法名称
     * @param [data] {Object} 数据
     * @param [callback] {Function} 回调
     */
    Dangke.fn.invoke = function (name, data, callback) {
        var the = this;
        var bridge = the.bridge;
        var args = arguments;
        var argL = args.length;
        var threeLength = 0;
        var oncallback = function (res) {
            the._onreceive.call(the, res, callback, name);
        };

        // invoke(name, data)
        // invoke(name)
        if (!typeis.function(args[argL - 1])) {
            callback = noop;
            threeLength = 2;
        }
        // invoke(name, data, callback)
        // invoke(name, callback)
        else {
            threeLength = 3;
        }

        if (argL === threeLength) {
            bridge.callHandler(name, data, oncallback);
        } else {
            bridge.callHandler(name, oncallback);
        }

        return the;
    };


    /**
     * 监听
     * @param event {String} 事件名称
     * @param [callback] {Function} 事件回调
     */
    Dangke.fn.listen = function (event, callback) {
        var the = this;

        callback = typeis.function(callback) ? callback : noop;
        the.bridge.registerHandler(event, function (res) {
            the._onreceive.call(the, res, callback, event);
        });
    };


    /**
     * 向 webview 发送数据
     * @param data {Object} JSON 数据
     * @param [callback] {Function} 响应回调
     */
    Dangke.fn.send = function (data, callback) {
        var the = this;

        callback = typeis.function(callback) ? callback : noop;
        the.bridge.send(data, function (res) {
            the._onreceive.call(the, res, callback, 'send');
        });

        return the;
    };


    /**
     * 分享
     * @param media {String} 媒体
     * @param [shareData] {Object} 分享数据
     * @param [callback] {Function} 分享回调
     */
    Dangke.fn.share = function (media, shareData, callback) {
        var the = this;
        var args = arguments;
        var argL = args.length;

        // .share(type, callback)
        // .share(type, shareData, callback)
        if (typeis.function(args[argL - 1])) {
            if (argL === 2) {
                shareData = null;
            }
        }
        // .share(type)
        // .share(type, shareData)
        else {
            if (argL === 1) {
                shareData = null;
            }

            callback = noop;
        }

        return the.invoke('share.' + media, dato.extend(true, {}, the.shareData, shareData), callback);
    };


    /**
     * 分享到微信朋友圈
     * @param [shareData] {Object} 分享的数据
     * @param [callback] {Function} 分享回调
     */
    Dangke.fn.shareTimeline = function (shareData, callback) {
        return this.share('timeline', shareData, callback);
    };


    /**
     * 分享到微信
     * @param [shareData] {Object} 分享的数据
     * @param [callback] {Function} 分享回调
     */
    Dangke.fn.shareWeixin = function (shareData, callback) {
        return this.share('weixin', shareData, callback);
    };


    /**
     * 分享到微博
     * @param [shareData] {Object} 分享的数据
     * @param [callback] {Function} 分享回调
     */
    Dangke.fn.shareWeibo = function (shareData, callback) {
        return this.share('weibo', shareData, callback);
    };


    /**
     * 报名活动后绑定手机号
     * @param [callback] {Function} 绑定成功或失败或取消后回调
     */
    Dangke.fn.bindMobile = function (callback) {
        return this.invoke('bind.mobile', callback);
    };


    /**
     * 地理位置
     * @param method {String} 方法
     * @param [data] {Object} 数据
     * @param [callback] {Function} 回调
     */
    Dangke.fn.geolocation = function (method, data, callback) {
        return this.invoke('geolocation.' + method, data, callback);
    };


    /**
     * 调用地图
     * @param address {String} 行政位置
     * @param [callback] {Function} 回调
     */
    Dangke.fn.geolocationMap = function (address, callback) {
        return this.geolocation('map', {address: address}, callback);
    };


    /**
     * 获取详细地理位置信息，包括经纬度、行政位置、国家、省份、城市
     * @param [callback] {Function} 回调
     */
    Dangke.fn.geolocationGet = function (callback) {
        return this.geolocation('get', callback);
    };


    /**
     * 导航栏
     * @param method {String} 方法
     * @param [data] {Object} 数据
     * @param [callback] {Function} 回调
     */
    Dangke.fn.navigation = function (method, data, callback) {
        return this.invoke('navigation.' + method, data, callback);
    };


    module.exports = Dangke;
});