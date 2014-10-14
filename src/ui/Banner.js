/**
 * Banner.js
 * @author ydr.me
 * @create 2014-10-10 22:36
 *
 */

define(function (require, exports, module) {
    /**
     * @module ui/Banner
     * @requires core/event/touch
     * @requires core/dom/modification
     * @requires core/dom/selector
     * @requires core/dom/animation
     * @requires util/class
     * @requires util/data
     * @requires libs/Emitter
     */
    'use strict';

    var noop = function () {
        // ignore
    };
    var index = 0;
    var event = require('../core/event/touch.js');
    var modification = require('../core/dom/modification.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var animation = require('../core/dom/animation.js');
    var klass = require('../util/class.js');
    var data = require('../util/data.js');
    var Emitter = require('../libs/Emitter.js');
    var navActiveClass = 'alien-ui-banner-nav-item-active';
    var navItemClass = 'alien-ui-banner-nav-item';
    var defaults = {
        width: 700,
        height: 300,
        item: 'li',
        duration: 456,
        timeout: 3456,
        easing: 'ease-in-out-back',
        // 0 不自动播放
        // -1 自动向前播放
        // 1 自动向后播放
        autoPlay: 1,
        addClass: '',
        // "circle" "square" "transparent"
        navStyle: 'circle',
        // "number" ""
        navText: ''
    };

    var Banner = klass.create({
        STATIC:{
            /**
             * 默认配置
             * @name defaults
             * @property {Number} [width=700] banner 宽度，默认700
             * @property {Number} [height=300] banner 高度，默认300
             * @property {String} [item="li"] banner 项目，默认"li"
             * @property {Number} [duration=456] banner 播放动画时间，默认456，单位毫秒
             * @property {String} [easing="ease-in-out-back"] banner 播放动画缓冲效果，默认"ease-in-out-back"
             * @property {Number} [autoPlay=1] banner 自动播放，1为自动向后播放，-1为自动向前播放，其他为不自动播放
             * @property {String} [addClass=""] banner 添加的 className
             * @property {String} [navStyle="circle"] banner 导航的样式，内置有"circle"、"square"、"transparent"，如果为空则不显示导航
             * @property {String} [navText=""] banner 导航的是否输出导航数字，内置有"number"
             */
            defaults: defaults
        },


        constructor: function (ele, options) {
            Emitter.apply(this, arguments);
            this._ele = ele;
            this._options = data.extend(!0, {}, defaults, options);
        },


        /**
         * 初始化
         * @public
         * @returns {Banner}
         */
        init: function () {
            var the = this;
            var options = the._options;

            the._id = ++index;
            the._showIndex = 0;
            the._items = selector.query(options.item, the._ele);
            the._wrap();
            the.resize(options);
            the.play(options.autoPlay);
            the._event();

            return the;
        },


        /**
         * 包裹
         * @private
         */
        _wrap: function () {
            var the = this;
            var options = the._options;
            var clone0;
            var clone1;
            var nav = '';

            if (options.navStyle) {
                nav = '<div class="alien-ui-banner-nav alien-ui-banner-nav-' + options.navStyle + '' +
                    (options.navText === 'number' ? ' alien-ui-banner-nav-text' : '') +
                    '">';

                data.each(the._items, function (index) {
                    nav += '<div class="alien-ui-banner-nav-item' +
                        (index === 0 ? ' ' + navActiveClass : '') +
                        '" data-index=' + index + '>' +
                        (options.navText === 'number' ? index + 1 : '&nbsp;') +
                        '</div>';
                });

                nav += '</div>';
            }

            if (the._items.length > 1) {
                // 复制头尾项目
                clone0 = the._items[0].cloneNode(!0);
                clone1 = the._items[the._items.length - 1].cloneNode(!0);

                modification.insert(clone1, the._ele, 'afterbegin');
                modification.insert(clone0, the._ele, 'beforeend');
                the._items.unshift(clone1);
                the._items.push(clone0);
            }

            // 包裹一层
            modification.wrap(the._ele, '<div id="alien-ui-banner-' + the._id + '" class="alien-ui-banner"/>');

            the._banner = selector.parent(the._ele)[0];
            nav = modification.parse(nav);
            the._nav = nav;

            if (nav && nav.length) {
                the._navItems = selector.children(nav[0]);
                modification.insert(nav[0], the._banner, 'beforeend');
            }

            attribute.addClass(the._banner, the._options.addClass);
        },


        /**
         * 添加事件监听
         * @private
         */
        _event: function () {
            var the = this;
            var options = the._options;
            var left;
            var x0;
            var x1;

            // 单击导航
            if (the._navItems) {
                event.on(the._banner, 'click tap', '.' + navItemClass, function () {
                    var index = attribute.data(this, 'index');
                    var type = index > the._showIndex ? 'next' : 'prev';

                    if (the._showIndex === the._items.length - 3 && index === 0) {
                        type = 'next';
                    } else if (the._showIndex === 0 && index === the._items.length - 3) {
                        type = 'prev';
                    }

                    the.pause();
                    the.index(type, index);
                });
            }

            // 鼠标悬停
            event.on(the._banner, 'mouseenter', function () {
                the.pause();
            });

            event.on(the._banner, 'mouseleave', function () {
                the.play(the._options.autoPlay);
            });

            // 触摸
            event.on(the._banner, 'touchstart', function (eve) {
                if (eve.touches && eve.touches.length === 1) {
                    the.pause();
                    attribute.css(the._items[0], 'visibility', 'hidden');
                    attribute.css(the._items[the._items.length - 1], 'visibility', 'hidden');
                    left = parseInt(attribute.css(the._ele, 'left'));
                    x0 = eve.touches[0].pageX;
                }

                eve.preventDefault();
            });

            event.on(the._banner, 'touchmove', function (eve) {
                if (eve.touches && eve.touches.length === 1) {
                    x1 = eve.touches[0].pageX;
                    attribute.css(the._ele, 'left', left + x1 - x0);
                }

                eve.preventDefault();
            });

            event.on(the._banner, 'touchend touchcancel', function (eve) {
                var index;

                if (eve.changedTouches && eve.changedTouches.length === 1) {
                    index = the._getIndex();

                    if (index === the._showIndex) {
                        animation.animate(the._ele, {
                            left: -(index + 1) * options.width
                        }, {
                            duration: options.duration,
                            easing: options.easing
                        }, _touchdone);
                    } else {
                        the.index(x1 <= x0 ? 'next' : 'prev', index, _touchdone);
                    }
                }
            });

            // 触摸结束
            function _touchdone() {
                attribute.css(the._items[0], 'visibility', 'visible');
                attribute.css(the._items[the._items.length - 1], 'visibility', 'visible');
            }
        },


        /**
         * 根据当前宽度计算索引值
         * @returns {number}
         * @private
         */
        _getIndex: function () {
            var the = this;
            var options = the._options;
            var left = -parseFloat(attribute.css(the._ele, 'left')) - options.width;

            // 左尽头
            if (left <= 0) {
                return 0;
            }
            // 右尽头
            else if (left >= options.width * (the._items.length - 3)) {
                return the._items.length - 3;
            }
            // 中间
            else {
                return Math.round(left / options.width);
            }
        },


        /**
         * 播放第几个项目
         * @param {String} [type] 展示方式，默认下一张
         * @param {Number} index 需要展示的序号
         * @param {Function} [callback] 回调
         */
        index: function (type, index, callback) {
            var args = arguments;
            var argL = args.length;
            var the = this;
            var options = the._options;
            var count = the._items.length - 2;
            var playIndex;

            if (count < 2 || index === the._showIndex) {
                return the;
            }

            if (data.type(args[0]) === 'number') {
                type = 'next';
                index = args[0];
            }

            callback = args[argL - 1];

            if (data.type(callback) !== 'function') {
                callback = noop;
            }

            playIndex =
                    type === 'next' ?
                (the._showIndex === count - 1 ? count + 1 : index + 1) :
                (the._showIndex === 0 ? 0 : index + 1);

            if (playIndex > count + 1) {
                throw new Error('can not go to ' + type + ' ' + index);
            }

            animation.animate(the._ele, {
                left: -options.width * playIndex
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                var siblings;

                // 替换结尾
                if (type !== 'next' && the._showIndex === 0) {
                    attribute.css(the._ele, 'left', -options.width * count);
                }
                // 替换开头
                else if (type === 'next' && the._showIndex === count - 1) {
                    attribute.css(the._ele, 'left', -options.width);
                }

                the._showIndex = index;

                the.emit('change', index);

                if (the._navItems) {
                    attribute.addClass(the._navItems[index], navActiveClass);
                    siblings = selector.siblings(the._navItems[index]);

                    data.each(siblings, function (i, sibling) {
                        attribute.removeClass(sibling, navActiveClass);
                    });
                }

                callback.call(the);
            });
        },


        /**
         * 播放到上一个项目
         * @param {Function} [callback] 回调
         * @returns {Banner}
         */
        prev: function (callback) {
            var the = this;
            var index = the._showIndex;

            if (the._items.length < 4) {
                return the;
            }

            index--;

            // 到达左边缘
            if (index < 0) {
                index = the._items.length - 3;
            }

            the.index('prev', index, callback);

            return the;
        },


        /**
         * 播放到下一个项目
         * @param {Function} [callback] 回调
         * @returns {Banner}
         */
        next: function (callback) {
            var the = this;
            var index = the._showIndex;

            if (the._items.length < 4) {
                return the;
            }

            index++;

            // 到达右边缘
            if (index === the._items.length - 2) {
                index = 0;
            }

            the.index('next', index, callback);

            return the;
        },


        /**
         * 自动播放
         * @param {Number} [autoPlay] 默认向后播放，-1为向前播放，1为向后播放
         * @returns {Banner}
         */
        play: function (autoPlay) {
            var the = this;
            var options = the._options;

            if (the._items.length < 4) {
                return the;
            }

            if (autoPlay === 1 || autoPlay === -1) {
                the.pause();
                options.autoPlay = autoPlay;

                the.timeid = setTimeout(function () {
                    if (autoPlay === 1) {
                        the.next();
                    } else if (autoPlay === -1) {
                        the.prev();
                    }

                    the.play(autoPlay);
                }, options.timeout);
            }

            return the;
        },


        /**
         * 暂停动画
         * @returns {Banner}
         */
        pause: function () {
            var the = this;

            if (the._items.length < 4) {
                return the;
            }

            if (the.timeid) {
                clearTimeout(the.timeid);
                the.timeid = 0;
            }

            return the;
        },


        /**
         * 重置尺寸
         * @param {Object} size  尺寸对象
         * @param {Number} [size.width]  宽度
         * @param {Number} [size.height]  高度
         * @returns {Banner}
         */
        resize: function (size) {
            var the = this;
            var options = the._options;

            options.width = size.width || options.width;
            options.height = size.height || options.height;

            data.each(the._items, function (index, item) {
                attribute.css(item, {
                    width: options.width,
                    height: options.height,
                    float: 'left'
                });
            });

            attribute.css(the._ele, {
                position: 'relative',
                left: the._items.length > 3 ? -(the._showIndex + 1) * options.width : 0,
                width: options.width * the._items.length,
                height: options.height
            });

            attribute.css(the._banner, {
                position: 'relative',
                width: options.width,
                height: options.height,
                overflow: 'hidden'
            });

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            // 移除所有事件
            event.un(the._banner, 'touchstart touchmove touchend touchcancel tap click mouseenter mouseleave');

            // 停止动画
            the.pause();

            data.each(the._items, function (index, item) {
                attribute.css(item, {
                    width: '',
                    height: '',
                    float: ''
                });
            });
            attribute.css(the._ele, {
                width: '',
                height: '',
                left: ''
            });

            // 移除 wrap
            modification.remove(the._nav);
            modification.unwrap(the._ele, 'div');
        }
    }, Emitter);
    var style =
        // 导航
        '.alien-ui-banner-nav{position:absolute;right:10px;bottom:10px;overflow:hidden;background:rgba(0, 0, 0, 0.33);padding:6px 12px;border-radius:4px}' +
        '.alien-ui-banner-nav-item{display:inline-block;width:10px;height:10px;line-height:10px;padding:0;margin:0 6px;text-align:center;background:#666;cursor:default}' +
        '.alien-ui-banner-nav-item-active{background:#fff}' +
        '.alien-ui-banner-nav-text .alien-ui-banner-nav-item{width:auto;height:20px;line-height:22px;font-size:12px;font-weight:normal;color:#EEE;padding:0 6px}' +
        '.alien-ui-banner-nav-text .alien-ui-banner-nav-item-active{color:#000}' +
        '.alien-ui-banner-nav-square .alien-ui-banner-nav-item{}' +
        '.alien-ui-banner-nav-circle .alien-ui-banner-nav-item{border-radius:100%}' +
        '.alien-ui-banner-nav-transparent{background:transparent}' +
        '.alien-ui-banner-nav-transparent .alien-ui-banner-nav-item{background:transparent;color:#999}' +
        '.alien-ui-banner-nav-transparent .alien-ui-banner-nav-item-active{color:#fff;font-weight:900}';

    modification.importStyle(style);


    /**
     * 构建一个 banner，标准的 DOM 结构为：<br>
     *     <code>ul#banner1>li*N</code>
     *
     * @param {HTMLElement|Node} ele 元素
     * @param {Object} [options] 配置
     * @param {Number} [options.width=700] banner 宽度，默认700
     * @param {Number} [options.height=300] banner 高度，默认300
     * @param {String} [options.item="li"] banner 项目，默认"li"
     * @param {Number} [options.duration=456] banner 播放动画时间，默认456，单位毫秒
     * @param {String} [options.easing="ease-in-out-back"] banner 播放动画缓冲效果，默认"ease-in-out-back"
     * @param {Number} [options.autoPlay=1] banner 自动播放，1为自动向后播放，-1为自动向前播放，其他为不自动播放
     * @param {String} [options.addClass=""] banner 添加的 className
     * @param {String} [options.navStyle="circle"] banner 导航的样式，内置有"circle"、"square"、"transparent"，如果为空则不显示导航
     * @param {String} [options.navText=""] banner 导航的是否输出导航数字，内置有"number"
     * @constructor
     */
    module.exports = Banner;
});