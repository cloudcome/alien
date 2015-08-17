/*!
 * 荡客客户端与前端交互
 *
 * 1. 数据 data
 * 2. 导航栏 navigation
 * 3. 分享 share
 * 4. 地理位置 geolocation
 * 5. 页面位置 location
 * 6. 用户 user
 * 7. 媒体 media
 * 8. 设备 device
 * 9. 对话框 dialog
 * 10. 底部 bottom
 *
 * @author ydr.me
 * @create 2015-03-10 17:29
 * @fix 2015-08-14 15:40:39
 */

// aos 和 ios 都已经在全局注入了相同的属性，并且都是同步的，因此可以不必等待 ready？
// ios https://github.com/marcuswestin/WebViewJavascriptBridge/blob/master/WebViewJavascriptBridge/WebViewJavascriptBridge.js.txt

// 【主动事件】
// data.send    发送数据

// data.send 发送数据包括
// 喜欢了该活动
//type: "love"
//
// 绑定了手机
//type: 'bindPhone',
//phone: '12312341234'


// 【被动的事件】
// club.follow    关注了俱乐部
// bottom.apply   点击了报名按钮
// bottom.respond 点击了咨询按钮
// location.back  点击了返回按钮，只在 location.fullscreen 时回调
// share.click    点击了分享按钮，type：分享类型
// input.submit   输入框回车提交

// share.click type 类型
//wxtimeline: "朋友圈",
//wxsession: "微信好友",
//sms: "短信",
//sina: "新浪微博",
//qq: "QQ 好友",
//qzone: "QQ 空间"

define(function (require, exports, module) {
    'use strict';

    var klass = require('./class.js');
    var controller = require('./controller.js');
    var allocation = require('./allocation.js');
    var typeis = require('./typeis.js');
    var dato = require('./dato.js');
    var Emitter = require('../libs/emitter.js');
    var win = window;
    var noop = function () {
        // ignore
    };
    var netMap = {
        '-1': 'unknow',
        0: 'none',
        1: 'wap',
        2: 'wifi'
    };
    // IOS: systemName/%@; systemVersion/%@; deviceVersion/%@; dangkr/1.1.5/%@
    // AOS: navigator.userAgent + "; dangkr/1.1.5/1"
    var ua = navigator.userAgent;
    var REG_END = /;([^;]*)$/;
    var isIOS = /iphone|ipad|ipod/i.test(navigator.appVersion || ua);
    var dkuaList = (ua.match(REG_END) || ['', ''])[1].split('/');
    var namespace = 'WebViewJavascriptBridge';
    var webViewJavascriptBridge = null;
    //var singleInstance = null;
    var hasReady = false;
    var hasBroken = false;
    var readyCallbackList = [];
    var brokenCallbackList = [];
    var defaults = {
        shareData: {},
        timeout: 1000
    };
    var Dangkr = klass.extends(Emitter).create({
        constructor: function (options) {
            var the = this;

            //the._namespace = 'WebViewJavascriptBridge';
            the._options = dato.extend(true, {}, defaults, options);
            the._shareData = the._options.shareData;
            //the._readyCallbacks = [];
            //the._brokenCallbacks = [];
            the._asyncCallbacks = {};
            the._andCallbacks = {};
            the._oneceCallbackList = ['media.input'];
            the._invokeList = [];
            the._initEvent();
        },


        /**
         * 设置 dkToken
         * @param json
         * @private
         */
        _setDkToken: function (json) {
            json = json || {};
            win[dangkr.tokenKey] = json.dkToken || '';
        },


        /**
         * 初始化事件
         * @returns {*}
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;
            var onready = function (bridge) {
                if (hasReady || hasBroken) {
                    return;
                }

                hasReady = true;
                //alert('dangkr ready');
                webViewJavascriptBridge = bridge;

                try {
                    bridge.init();
                } catch (err) {
                    // ignore
                }

                the._invokeList.forEach(function (args) {
                    the.invoke.apply(the, args);
                });
                the._invokeList = [];

                /**
                 * 是否为 Android 客户端
                 * @type {boolean}
                 * @private
                 */
                the._isAndroid = !!bridge.require;
                the.isDangkr = true;
                the.platform = the._isAndroid ? 'aos' : 'ios';


                /**
                 * jsbridge 准备完毕
                 * @event ready
                 * @param bridge {Object} jsbridge 对象
                 */
                the.emit('ready', bridge);
                readyCallbackList.forEach(function (callback) {
                    callback.call(the);
                });
            };
            var onbroken = function () {
                if (hasReady || hasBroken) {
                    return;
                }

                hasBroken = true;
                //alert('dangkr broken');
                the.platform = isIOS ? 'ios' : 'aos';
                the.emit('broken');
                brokenCallbackList.forEach(function (callback) {
                    callback.call(the);
                });
            };
            var past = Date.now();

            the._timeid = setInterval(function () {
                if (Date.now() - past > options.timeout) {
                    clearInterval(the._timeid);
                    return onbroken();
                }

                if (namespace in win && !hasReady) {
                    clearInterval(the._timeid);
                    onready(win[namespace]);
                }
            }, 10);

            // WebViewJavascriptBridgeReady
            document.addEventListener(namespace + 'Ready', function (eve) {
                onready(eve.bridge);
            });
        },


        /**
         * 接收数据
         * @param res
         * @param callback
         * @param emitName
         * @private
         */
        _onreceive: function (res, callback, emitName) {
            var the = this;
            var err = null;
            var ret = res.result;

            // {code: 200, message: "", result: "..."}
            //alert(emitName + ' => ' + JSON.stringify(res));

            if (res.code !== 200) {
                err = new Error(res.message);
            }

            // 针对 AOS 进行单独处理
            if (the._isAndroid && emitName === 'input.submit' && ret.atParent) {
                ret.value = ret.value.replace(/^回复 .*?：/, '');
            }

            callback(err, ret, res);

            /**
             * 调用事件
             */
            the.emit(emitName, err, ret, res);
        },


        /**
         * 调用 webview 方法
         * @param name {String} 方法名称
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        invoke: function (name, data, callback) {
            var the = this;
            var args = allocation.args(arguments);
            var argL = args.length;

            if (!webViewJavascriptBridge) {
                the._invokeList.push(args);
                return the;
            }

            // invoke(name, data, callback)
            // invoke(name, callback)
            if (typeis.function(args[argL - 1])) {
                if (argL === 2) {
                    callback = args[1];
                    data = null;
                }
            }
            // invoke(name, data)
            // invoke(name)
            else {
                callback = noop;
            }

            var oncallback = function (res) {
                the._onreceive.call(the, res, callback, name);
            };

            if (typeis.function(webViewJavascriptBridge.callHandler)) {
                webViewJavascriptBridge.callHandler(name, data, oncallback);
            } else if (webViewJavascriptBridge.require) {
                var res = webViewJavascriptBridge.require(name, JSON.stringify({data: data}));

                if (!typeis.object(res)) {
                    try {
                        res = JSON.parse(res);
                    } catch (err) {
                        res = {
                            code: 500,
                            message: err.message
                        };
                    }
                }

                if (typeis.undefined(res.code)) {
                    res.code = 200;
                }

                if (typeis.undefined(res.result)) {
                    res.result = {};
                }

                oncallback(res);
            }

            return the;
        },


        /**
         * 监听
         * @param event {String} 事件名称
         * @param [callback] {Function} 事件回调
         */
        when: function (event, callback) {
            var the = this;


            callback = typeis.function(callback) ? callback : noop;

            if (webViewJavascriptBridge && webViewJavascriptBridge.registerHandler) {
                webViewJavascriptBridge.registerHandler(event, function (res) {
                    the._onreceive.call(the, res, callback, event);
                });
            } else {
                the._andCallbacks[event] = the._andCallbacks[event] || [];
                callback._type = event;

                // 如果是仅触发一次的事件
                if (the._oneceCallbackList.indexOf(event) > -1) {
                    the._andCallbacks[event] = [callback];
                } else {
                    the._andCallbacks[event].push(callback);
                }

                win[namespace + event] = function (res) {
                    the._onreceive.call(the, res, function (err, json) {
                        var self = this;
                        var args = arguments;

                        if (event === 'user.login') {
                            the._setDkToken(json);
                        }

                        controller.nextTick(function () {
                            dato.each(the._andCallbacks[event], function (index, cb) {
                                cb.apply(self, args);
                            });

                            try {
                                document.body.focus();
                            } catch (err) {
                                // ignore
                            }
                        });
                    }, event);
                };
            }

            return the;
        },


        /**
         * 荡客准备完毕后执行
         * @param callback {Function} 事件回调
         */
        ready: function (callback) {
            var the = this;

            if (typeis.function(callback)) {
                if (hasReady) {
                    callback.call(the);
                } else {
                    readyCallbackList.push(callback);
                }
            }

            return the;
        },


        /**
         * 荡客准备失败后执行
         * @param callback {Function} 事件回调
         */
        broken: function (callback) {
            var the = this;

            if (typeis.function(callback)) {
                if (hasBroken) {
                    callback.call(the);
                } else {
                    brokenCallbackList.push(callback);
                }
            }

            return the;
        },


        /**
         * 总是执行
         * @param callback {Function} 事件回调
         */
        always: function (callback) {
            var the = this;

            if (typeis.function(callback)) {
                if (hasReady || hasBroken) {
                    callback.call(the);
                } else if (!hasReady && !hasBroken) {
                    readyCallbackList.push(callback);
                    brokenCallbackList.push(callback);
                }
            }

            return the;
        },


        /**
         * 数据交互
         * @param method {String} 方法
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        _data: function (method, data, callback) {
            return this.invoke('data.' + method, data, callback);
        },


        /**
         * 发送数据
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        dataSend: function (data, callback) {
            return this._data('send', data, callback);
        },


        /**
         * 导航栏交互
         * @param method {String} 方法
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        _navigation: function (method, data, callback) {
            return this.invoke('navigation.' + method, data, callback);
        },


        /**
         * 显示导航栏图标
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         * @returns {*}
         *
         * @example
         * // type: back/share/report/done
         * .navigationShow([{
         *     type: "share",
         *     data: {}
         * }, {
         *     type: "back"
         * }]);
         */
        navigationShow: function (data, callback) {
            if (typeis.object(data)) {
                data = [data];
            }

            return this._navigation('show', data || [], callback);
        },


        /**
         * 改变导航栏标题
         * @param [data] {String} 数据
         * @param [callback] {Function} 回调
         * @returns {*}
         *
         * @example
         * .navigationTitle('动态页面标题');
         */
        navigationTitle: function (data, callback) {
            return this._navigation('title', data || document.title, callback);
        },


        /**
         * 分享
         * @param media {String} 媒体
         * @param [shareData] {Object} 分享数据
         * @param [shareData.title] {String} 分享的标题
         * @param [shareData.desc] {String} 分享的描述/副标题
         * @param [shareData.link] {String} 分享的链接地址
         * @param [shareData.img] {String} 分享的图片地址
         * @param [callback] {Function} 分享回调
         */
        _share: function (media, shareData, callback) {
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

            return the.invoke('share.' + media, dato.extend(true, {}, the._shareData, shareData), callback);
        },


        /**
         * 设置分享数据
         * @param [shareData] {Object} 分享的数据
         * @param [shareData.title] {String} 分享的标题
         * @param [shareData.desc] {String} 分享的描述/副标题
         * @param [shareData.link] {String} 分享的链接地址
         * @param [shareData.img] {String} 分享的图片地址
         * @param [callback] {Function} 分享回调
         */
        shareData: function (shareData, callback) {
            return this;
            //return this._share('data', shareData, callback);
        },


        /**
         * 打开分享窗口
         * @param [shareData] {Object} 分享的数据
         * @param [shareData.title] {String} 分享的标题
         * @param [shareData.desc] {String} 分享的描述/副标题
         * @param [shareData.link] {String} 分享的链接地址
         * @param [shareData.img] {String} 分享的图片地址
         * @param [callback] {Function} 回调
         */
        shareOpen: function (shareData, callback) {
            return this._share('open', shareData, callback);
        },


        /**
         * 关闭分享窗口
         * @param [callback] {Function} 回调
         */
        shareClose: function (callback) {
            return this._share('close', callback);
        },


        /**
         * 分享到微信朋友圈
         * @param [shareData] {Object} 分享的数据
         * @param [shareData.title] {String} 分享的标题
         * @param [shareData.desc] {String} 分享的描述/副标题
         * @param [shareData.link] {String} 分享的链接地址
         * @param [shareData.img] {String} 分享的图片地址
         * @param [callback] {Function} 分享回调
         */
        shareTimeline: function (shareData, callback) {
            return this._share('timeline', shareData, callback);
        },


        /**
         * 分享到微信
         * @param [shareData] {Object} 分享的数据
         * @param [shareData.title] {String} 分享的标题
         * @param [shareData.desc] {String} 分享的描述/副标题
         * @param [shareData.link] {String} 分享的链接地址
         * @param [shareData.img] {String} 分享的图片地址
         * @param [callback] {Function} 分享回调
         */
        shareWeixin: function (shareData, callback) {
            return this._share('weixin', shareData, callback);
        },


        /**
         * 分享到微博
         * @param [shareData] {Object} 分享的数据
         * @param [shareData.title] {String} 分享的标题
         * @param [shareData.desc] {String} 分享的描述/副标题
         * @param [shareData.link] {String} 分享的链接地址
         * @param [shareData.img] {String} 分享的图片地址
         * @param [callback] {Function} 分享回调
         */
        shareWeibo: function (shareData, callback) {
            return this._share('weibo', shareData, callback);
        },


        /**
         * 分享到QQ好友
         * @param [shareData] {Object} 分享的数据
         * @param [shareData.title] {String} 分享的标题
         * @param [shareData.desc] {String} 分享的描述/副标题
         * @param [shareData.link] {String} 分享的链接地址
         * @param [shareData.img] {String} 分享的图片地址
         * @param [callback] {Function} 分享回调
         */
        shareQQfriend: function (shareData, callback) {
            return this._share('qqfriend', shareData, callback);
        },


        /**
         * 分享到QQ空间
         * @param [shareData] {Object} 分享的数据
         * @param [shareData.title] {String} 分享的标题
         * @param [shareData.desc] {String} 分享的描述/副标题
         * @param [shareData.link] {String} 分享的链接地址
         * @param [shareData.img] {String} 分享的图片地址
         * @param [callback] {Function} 分享回调
         */
        shareQQzone: function (shareData, callback) {
            return this._share('qqzone', shareData, callback);
        },


        /**
         * 分享到短信
         * @param [shareData] {Object} 分享的数据
         * @param [shareData.title] {String} 分享的标题
         * @param [shareData.desc] {String} 分享的描述/副标题
         * @param [shareData.link] {String} 分享的链接地址
         * @param [shareData.img] {String} 分享的图片地址
         * @param [callback] {Function} 分享回调
         */
        shareSMS: function (shareData, callback) {
            return this._share('sms', shareData, callback);
        },


        /**
         * 地理位置
         * @param method {String} 方法
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        _geolocation: function (method, data, callback) {
            return this.invoke('geolocation.' + method, data, callback);
        },


        /**
         * 调用地图
         * @param address {String} 行政位置
         * @param [callback] {Function} 回调
         */
        geolocationMap: function (address, callback) {
            return this._geolocation('map', {address: address}, callback);
        },


        /**
         * 获取详细地理位置信息，包括经纬度、行政位置、国家、省份、城市
         * @param [callback] {Function} 回调
         */
        geolocationGet: function (callback) {
            return this._geolocation('get', callback);
        },


        /**
         * 导航栏
         * @param method {String} 方法
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        _location: function (method, data, callback) {
            return this.invoke('location.' + method, data, callback);
        },


        /**
         * 页面跳转
         * @param [data] {Object} 数据
         * @param [data.type] {String} 类型：myActivity/captain/club
         * @param [data.id] {Number} ID 值
         * @param [callback] {Function} 回调
         */
        locationRedirect: function (data, callback) {
            if (data.type === 'user' && dangkr.version <= '1.3.0') {
                data.type = 'captain';

                return this._location('redirect', data, callback);
            }

            return this._location('redirect', data, callback);
        },


        /**
         * 页面关闭
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        locationClose: function (data, callback) {
            return this._location('close', data, callback);
        },


        /**
         * 页面关闭
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        locationFullscreen: function (data, callback) {
            return this._location('fullscreen', data, callback);
        },


        /**
         * 页面终点
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        locationFinished: function (data, callback) {
            return this._location('finished', data, callback);
        },


        /**
         * 用户数据的相关操作
         * @param method {String} 方法
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        _user: function (method, data, callback) {
            return this.invoke('user.' + method, data, callback);
        },


        /**
         * 获取当前用户
         * @param [callback] {Function} 回调
         *
         * callback 参数
         * .userId: 用户ID
         * .city: 用户所在的城市
         * .nickname: 昵称
         * .phone: 手机号
         * .dkToken: 荡客用户鉴权值
         */
        userGet: function (callback) {
            var the = this;

            callback = typeis.function(callback) ? callback : noop;

            return the._user('get', function (err, json) {
                the._setDkToken(json);

                if (err) {
                    return callback(err);
                }

                callback(err, json);
            });
        },


        /**
         * 登录
         * @param [callback] {Function} 回调
         */
        userLogin: function (callback) {
            var the = this;
            var event = 'user.login';

            if (the._isAndroid) {
                the.when(event, callback);
                callback = null;
            }

            callback = typeis.function(callback) ? callback : noop;

            return the._user('login', function (err, json) {
                the._setDkToken(json);

                if (err) {
                    return callback(err);
                }

                callback(err, json);
            });
        },


        /**
         * 注销
         * @param [callback] {Function} 回调
         */
        userLogout: function (callback) {
            return this._user('logout', callback);
        },


        /**
         * 媒体
         * @param method {String} 方法
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        _media: function (method, data, callback) {
            return this.invoke('media.' + method, data, callback);
        },


        /**
         * 输入文字
         * @param [data] {Object} 数据
         * @param [data.placeholder=""] {String} 占位符
         * @param [data.type="text"] {String} 输入类型
         * @param [data.maxLength=-1] {Number} 输入最大长度，-1为无限制
         * @param [callback] {Function} 回调
         *
         * callback 返回参数:
         * .value: 书写内容
         */
        mediaInput: function (data, callback) {
            var the = this;
            var event = 'media.input';

            data = dato.extend({}, {
                placeholder: '说点什么吧',
                type: 'text',
                atParent: 0,
                maxLength: -1
            }, data);

            if (data.atParent) {
                data.atText = data.placeholder;
            }

            if (the._isAndroid) {
                the.when(event, callback);
                callback = null;
            }

            return the._media('input', data, callback);
        },


        /**
         * 图片查看器
         * @param [data] {Object} 数据
         * @param [data.list] {Array} 图片列表数组
         * @param [data.active=0] {Number} 默认展示的图片索引
         * @param [callback] {Function} 回调
         */
        mediaPicture: function (data, callback) {
            data = dato.extend({}, {
                list: [],
                active: 0
            }, data);
            return this._media('picture', data, callback);
        },


        /**
         * 选择图片
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        mediaImg: function (data, callback) {
            return this._media('img', data, callback);
        },


        /**
         * 上传图片
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        mediaUpload: function (data, callback) {
            return this._media('upload', data, callback);
        },


        /**
         * 设备的相关操作
         * @param method {String} 方法
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        _device: function (method, data, callback) {
            return this.invoke('device.' + method, data, callback);
        },


        /**
         * 获取设备所连接的网络
         * @param [callback] {Function} 回调
         */
        deviceNetwork: function (callback) {
            return this._device('network', callback);
        },


        /**
         * 获取设备的系统信息
         * @param [callback] {Function} 回调
         */
        deviceSystem: function (callback) {
            return this._device('system', callback);
        },


        /**
         * 对话框的相关操作
         * @param method {String} 方法
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        _dialog: function (method, data, callback) {
            return this.invoke('dialog.' + method, data, callback);
        },


        /**
         * 打开 loading
         * @param [data] {Object} 数据
         * @param [data.modal=true] {Boolean} 是否为模态,默认true
         * @param [data.text="加载中"] {String} loading 文本
         * @param [callback] {Function} 回调
         */
        dialogLoadingOpen: function (data, callback) {
            data = dato.extend({}, {
                modal: true,
                text: '加载中'
            }, data);
            return this._dialog('loading.open', data, callback);
        },


        /**
         * 关闭 loading
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        dialogLoadingClose: function (data, callback) {
            return this._dialog('loading.close', data, callback);
        },


        /**
         * 打开 tips
         * @param [data] {Object} 数据
         * @param [data.modal=true] {Boolean} 是否为模态,默认true
         * @param [data.text="提示"] {String} tips 文本
         * @param [data.timeout=3] {Number} 超时时间,单位秒
         * @param [callback] {Function} 回调
         */
        dialogTipsOpen: function (data, callback) {
            data = dato.extend({}, {
                modal: true,
                text: '提示',
                timeout: 3
            }, data);

            return this._dialog('tips.open', data, callback);
        },


        /**
         * 底部按钮的一些交互
         * @param method {String} 方法
         * @param [data] {Object} 数据
         * @param [callback] {Function} 回调
         */
        _bottom: function (method, data, callback) {
            return this.invoke('bottom.' + method, data, callback);
        },


        /**
         * 显示/隐藏底部报名按钮
         * @param [data]
         * @param [callback]
         * @returns {*}
         */
        bottomApply: function (data, callback) {
            data = dato.extend({}, {
                // 是否可报名
                active: false,
                // 是否隐藏
                hidden: true
            }, data);
            return this._bottom('apply', data, callback);
        },


        /**
         * 显示/隐藏底部输入框
         * @param [data]
         * @param [callback]
         * @returns {*}
         */
        bottomInput: function (data, callback) {
            data = dato.extend({}, {
                placeholder: '说点什么吧',
                type: 'text',
                atParent: 0,
                maxLength: -1,
                hidden: true
            }, data);

            return this._bottom('input', data, callback);
        }
    });
    var dangkr = new Dangkr();

    dangkr.tokenKey = '-dkToken-';
    dangkr.isDangkr = /\bdangk(e|r)\b/i.test(ua) || namespace in win;
    dangkr.defaults = defaults;
    dangkr.version = dkuaList[1] || '1.1.0';
    dangkr.network = dkuaList[2] ? netMap[dkuaList[2]] : 'unknow';
    dangkr.platform = isIOS ? 'ios' : 'aos';
    module.exports = dangkr;
});