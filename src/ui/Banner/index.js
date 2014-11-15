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
     * @requires util/dato
     * @requires libs/Emitter
     * @requires libs/Template
     */
    'use strict';

    var noop = function () {
        // ignore
    };
    var index = 0;
    var style = require('css!./style.css');
    var template = require('html!./template.html');
    var event = require('../../core/event/touch.js');
    var modification = require('../../core/dom/modification.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var ui = require('../base.js');
    var dato = require('../../util/dato.js');
    var Emitter = require('../../libs/Emitter.js');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var alienClass = 'alien-ui-banner';
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
        // 导航生成器
        navGenerator: null
    };

    var Banner = ui({
        STATIC: {
            /**
             * 默认配置
             * @name defaults
             * @property {Number} [width=700] banner 宽度，默认700
             * @property {Number} [height=300] banner 高度，默认300
             * @property {String} [item="li"] banner 项目选择器，默认"li"
             * @property {Number} [duration=456] banner 播放动画时间，默认456，单位毫秒
             * @property {String} [easing="ease-in-out-back"] banner 播放动画缓冲效果，默认"ease-in-out-back"
             * @property {Number} [autoPlay=1] banner 自动播放，1为自动向后播放，-1为自动向前播放，其他为不自动播放
             * @property {null|Function} [navGenerator=null] 使用一个函数生成导航，参数1为导航索引值
             */
            defaults: defaults
        },


        constructor: function (ele, options) {
            var the = this;

            ele = selector.query(ele);

            if (!ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = ele[0];
            Emitter.apply(the, arguments);
            the._options = dato.extend(!0, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @public
         * @returns {Banner}
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;

            the._id = ++index;
            the._showIndex = 0;
            the._$items = selector.query(options.item, the._$ele);
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
            var bannerData = {
                id: the._id,
                nav: []
            };
            var navFilter = dato.type(options.nav) === 'function' ? options.nav : function () {
                return '';
            };
            var $bannerWrap;

            dato.each(the._$items, function (index) {
                bannerData.nav.push(navFilter(index));
            });

            $bannerWrap = modification.parse(tpl.render(bannerData))[0];
            modification.insert($bannerWrap, the._$ele, 'afterend');
            modification.insert(the._$ele, $bannerWrap, 'afterbegin');

            if (the._$items.length > 1) {
                // 复制头尾项目
                clone0 = the._$items[0].cloneNode(!0);
                clone1 = the._$items[the._$items.length - 1].cloneNode(!0);

                modification.insert(clone1, the._$ele, 'afterbegin');
                modification.insert(clone0, the._$ele, 'beforeend');
                the._$items.unshift(clone1);
                the._$items.push(clone0);
            }

            the._$banner = $bannerWrap;
            the._$nav = selector.query('.' + alienClass + '-nav', $bannerWrap)[0];

            if (the._$nav) {
                the._$navItems = selector.children(the._$nav);
            } else {
                the._$navItems = [];
            }
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
            if (the._$navItems.length) {
                event.on(the._$banner, 'click tap', '.' + alienClass + '-nav-item', function () {
                    var index = attribute.data(this, 'index');
                    var type = index > the._showIndex ? 'next' : 'prev';

                    if (the._showIndex === the._$items.length - 3 && index === 0) {
                        type = 'next';
                    } else if (the._showIndex === 0 && index === the._$items.length - 3) {
                        type = 'prev';
                    }

                    the.pause();
                    the.index(type, index);
                });
            }

            // 鼠标悬停
            event.on(the._$banner, 'mouseenter', function () {
                the.pause();
            });

            event.on(the._$banner, 'mouseleave', function () {
                the.play(the._options.autoPlay);
            });

            // 触摸
            event.on(the._$banner, 'touchstart', function (eve) {
                if (eve.touches && eve.touches.length === 1) {
                    the.pause();
                    attribute.css(the._$items[0], 'visibility', 'hidden');
                    attribute.css(the._$items[the._$items.length - 1], 'visibility', 'hidden');
                    left = parseInt(attribute.css(the._$ele, 'left'));
                    x0 = eve.touches[0].pageX;
                }

                eve.preventDefault();
            });

            event.on(the._$banner, 'touchmove', function (eve) {
                if (eve.touches && eve.touches.length === 1) {
                    x1 = eve.touches[0].pageX;
                    attribute.css(the._$ele, 'left', left + x1 - x0);
                }

                eve.preventDefault();
            });

            event.on(the._$banner, 'touchend touchcancel', function (eve) {
                var index;

                if (eve.changedTouches && eve.changedTouches.length === 1) {
                    index = the._getIndex();

                    if (index === the._showIndex) {
                        animation.animate(the._$ele, {
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
                attribute.css(the._$items[0], 'visibility', 'visible');
                attribute.css(the._$items[the._$items.length - 1], 'visibility', 'visible');
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
            var left = -parseFloat(attribute.css(the._$ele, 'left')) - options.width;

            // 左尽头
            if (left <= 0) {
                return 0;
            }
            // 右尽头
            else if (left >= options.width * (the._$items.length - 3)) {
                return the._$items.length - 3;
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
            var count = the._$items.length - 2;
            var playIndex;

            if (count < 2 || index === the._showIndex) {
                return the;
            }

            if (dato.type(args[0]) === 'number') {
                type = 'next';
                index = args[0];
            }

            callback = args[argL - 1];

            if (dato.type(callback) !== 'function') {
                callback = noop;
            }

            playIndex =
                type === 'next' ?
                    (the._showIndex === count - 1 ? count + 1 : index + 1) :
                    (the._showIndex === 0 ? 0 : index + 1);

            if (playIndex > count + 1) {
                throw new Error('can not go to ' + type + ' ' + index);
            }

            the.emit('beforechange', the._showIndex, index);

            animation.animate(the._$ele, {
                left: -options.width * playIndex
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                var siblings;

                // 替换结尾
                if (type !== 'next' && the._showIndex === 0) {
                    attribute.css(the._$ele, 'left', -options.width * count);
                }
                // 替换开头
                else if (type === 'next' && the._showIndex === count - 1) {
                    attribute.css(the._$ele, 'left', -options.width);
                }

                the.emit('change', index, the._showIndex);
                the._showIndex = index;

                if (the._$navItems) {
                    attribute.addClass(the._$navItems[index], alienClass + '-nav-item-active');
                    siblings = selector.siblings(the._$navItems[index]);

                    dato.each(siblings, function (i, sibling) {
                        attribute.removeClass(sibling, alienClass + '-nav-item-active');
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

            if (the._$items.length < 4) {
                return the;
            }

            index--;

            // 到达左边缘
            if (index < 0) {
                index = the._$items.length - 3;
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

            if (the._$items.length < 4) {
                return the;
            }

            index++;

            // 到达右边缘
            if (index === the._$items.length - 2) {
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

            if (the._$items.length < 4) {
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

            if (the._$items.length < 4) {
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

            dato.each(the._$items, function (index, item) {
                attribute.css(item, {
                    width: options.width,
                    height: options.height,
                    float: 'left'
                });
            });

            attribute.css(the._$ele, {
                position: 'relative',
                left: the._$items.length > 3 ? -(the._showIndex + 1) * options.width : 0,
                width: options.width * the._$items.length,
                height: options.height
            });

            attribute.css(the._$banner, {
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
            event.un(the._$banner, 'touchstart touchmove touchend touchcancel tap click mouseenter mouseleave');

            // 停止动画
            the.pause();

            dato.each(the._$items, function (index, item) {
                attribute.css(item, {
                    width: '',
                    height: '',
                    float: ''
                });
            });
            attribute.css(the._$ele, {
                width: '',
                height: '',
                left: ''
            });

            modification.insert(the._$ele, the._$banner, 'afterend');
            modification.remove(the._$items[the._$items.length - 1]);
            modification.remove(the._$items[0]);
            modification.remove(the._$banner);
        }
    }, Emitter);

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