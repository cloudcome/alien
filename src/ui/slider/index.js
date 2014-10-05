/*!
 * index.js
 * @author ydr.me
 * @create 2014-10-05 14:18
 */


define(function (require, exports, module) {
    /**
     * 构建一个 slider，标准的 DOM 结构为：<br>
     * <code>ul#slider1>li*N</code>
     *
     * @module ui/slider/index
     * @requires core/event/touch
     */

    'use strict';

    require('./style.js');

    var noop = function () {
        // ignore
    };
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
        navText: '',
        onchange: noop
    };
    var index = 0;
    var event = require('../../core/event/touch.js');
    var modification = require('../../core/dom/modification.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var klass = require('../../util/class.js');
    var data = require('../../util/data.js');
    var navActiveClass = 'alien-ui-slider-nav-item-active';
    var navItemClass = 'alien-ui-slider-nav-item';
    var Slider = klass.create({
        constructor: function (ele, options) {
            this.ele = ele;
            this.options = options;
        },


        /**
         * 初始化
         * @returns {Slider}
         * @private
         */
        _init: function () {
            var the = this;
            var options = the.options;

            the.id = ++index;
            the.showIndex = 0;
            the.items = selector.query(options.item, the.ele);
            the._wrap();
            the.resize(options.width, options.height);
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
            var options = the.options;
            var clone0;
            var clone1;
            var nav = '';

            if (options.navStyle) {
                nav = '<div class="alien-ui-slider-nav alien-ui-slider-nav-' + options.navStyle + '' +
                    (options.navText === 'number' ? ' alien-ui-slider-nav-text' : '') +
                    '">';

                data.each(the.items, function (index) {
                    nav += '<div class="alien-ui-slider-nav-item' +
                        (index === 0 ? ' ' + navActiveClass : '')
                        + '" data-index=' + index + '>' +
                        (options.navText === 'number' ? index + 1 : '&nbsp;')
                        + '</div>';
                });

                nav += '</div>';
            }

            if (the.items.length > 1) {
                // 复制头尾项目
                clone0 = the.items[0].cloneNode(!0);
                clone1 = the.items[the.items.length - 1].cloneNode(!0);

                modification.insert(clone1, the.ele, 'afterbegin');
                modification.insert(clone0, the.ele, 'beforeend');
                the.items.unshift(clone1);
                the.items.push(clone0);
            }

            // 包裹一层
            modification.wrap(this.ele, '<div id="alien-ui-slider-' + the.id + '" class="alien-ui-slider"/>');

            the.wrap = selector.parent(this.ele)[0];
            nav = modification.parse(nav);
            the.nav = nav;

            if (nav && nav.length) {
                the.navItems = selector.children(nav[0]);
                modification.insert(nav[0], the.wrap, 'beforeend');
            }

            attribute.addClass(the.wrap, the.options.addClass);
        },


        /**
         * 添加事件监听
         * @private
         */
        _event: function () {
            var the = this;
            var options = the.options;
            var left;
            var x0;
            var x1;

            // 单击导航
            if (the.navItems) {
                event.on(the.wrap, 'click tap', '.' + navItemClass, function () {
                    var index = attribute.data(this, 'index');
                    var type = index > the.showIndex ? 'next' : 'prev';

                    if (the.showIndex === the.items.length - 3 && index === 0) {
                        type = 'next';
                    } else if (the.showIndex === 0 && index === the.items.length - 3) {
                        type = 'prev';
                    }

                    the.pause();
                    the.index(type, index);
                });
            }

            // 鼠标悬停
            event.on(the.wrap, 'mouseenter', function () {
                the.pause();
            });

            event.on(the.wrap, 'mouseleave', function () {
                the.play(the.options.autoPlay);
            });

            // 触摸
            event.on(the.wrap, 'touchstart', function (eve) {
                if (eve.touches && eve.touches.length === 1) {
                    the.pause();
                    attribute.css(the.items[0], 'visibility', 'hidden');
                    attribute.css(the.items[the.items.length - 1], 'visibility', 'hidden');
                    left = parseInt(attribute.css(the.ele, 'left'));
                    x0 = eve.touches[0].pageX;
                }

                eve.preventDefault();
            });

            event.on(the.wrap, 'touchmove', function (eve) {
                if (eve.touches && eve.touches.length === 1) {
                    x1 = eve.touches[0].pageX;
                    attribute.css(the.ele, 'left', left + x1 - x0);
                }

                eve.preventDefault();
            });

            event.on(the.wrap, 'touchend touchcancel', function (eve) {
                var index;

                if (eve.changedTouches && eve.changedTouches.length === 1) {
                    index = the._getIndex();

                    if (index === the.showIndex) {
                        animation.animate(the.ele, {
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
                attribute.css(the.items[0], 'visibility', 'visible');
                attribute.css(the.items[the.items.length - 1], 'visibility', 'visible');
            }
        },


        /**
         * 根据当前宽度计算索引值
         * @returns {number}
         * @private
         */
        _getIndex: function () {
            var the = this;
            var options = the.options;
            var left = -parseFloat(attribute.css(the.ele, 'left')) - options.width;

            // 左尽头
            if (left <= 0) {
                return 0;
            }
            // 右尽头
            else if (left >= options.width * (the.items.length - 3)) {
                return the.items.length - 3;
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
            var options = the.options;
            var count = the.items.length - 2;
            var playIndex;

            if (count < 2 || index === the.showIndex) {
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
                (the.showIndex === count - 1 ? count + 1 : index + 1) :
                (the.showIndex === 0 ? 0 : index + 1);

            if (playIndex > count + 1) {
                throw new Error('can not go to ' + type + ' ' + index);
            }

            animation.animate(the.ele, {
                left: -options.width * playIndex
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                var siblings;

                // 替换结尾
                if (type !== 'next' && the.showIndex === 0) {
                    attribute.css(the.ele, 'left', -options.width * count);
                }
                // 替换开头
                else if (type === 'next' && the.showIndex === count - 1) {
                    attribute.css(the.ele, 'left', -options.width);
                }

                the.showIndex = index;

                if (data.type(options.onchange) === 'function') {
                    options.onchange.call(the, index);
                }

                if (the.navItems) {
                    attribute.addClass(the.navItems[index], navActiveClass);
                    siblings = selector.siblings(the.navItems[index]);

                    data.each(siblings, function (i, sibling) {
                        attribute.removeClass(sibling, navActiveClass);
                    });
                }

                callback.call(the);
            });
        },


        /**
         * 播放到上一个项目
         * @param {Function} callback 回调
         * @returns {Slider}
         */
        prev: function (callback) {
            var the = this;
            var index = the.showIndex;

            if (the.items.length < 4) {
                return the;
            }

            index--;

            // 到达左边缘
            if (index < 0) {
                index = the.items.length - 3;
            }

            the.index('prev', index, callback);

            return the;
        },


        /**
         * 播放到下一个项目
         * @param {Function} callback 回调
         * @returns {Slider}
         */
        next: function (callback) {
            var the = this;
            var index = the.showIndex;

            if (the.items.length < 4) {
                return the;
            }

            index++;

            // 到达右边缘
            if (index === the.items.length - 2) {
                index = 0;
            }

            the.index('next', index, callback);

            return the;
        },


        /**
         * 自动播放
         * @param {Number} [autoPlay] 默认向后播放，-1为向前播放，1为向后播放
         * @returns {Slider}
         */
        play: function (autoPlay) {
            var the = this;
            var options = the.options;

            if (the.items.length < 4) {
                return the;
            }

            if (autoPlay === 1 || autoPlay === -1) {
                the.pause();
                options.autoPlay = autoPlay;

                the.timeid = setTimeout(function () {
                    autoPlay === 1 ? the.next() : the.prev();
                    the.play(autoPlay);
                }, options.timeout);
            }

            return the;
        },


        /**
         * 暂停动画
         * @returns {Slider}
         */
        pause: function () {
            var the = this;

            if (the.items.length < 4) {
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
         * @param {Number} width 宽度
         * @param {Number} height 高度
         * @returns {Slider}
         */
        resize: function (width, height) {
            var the = this;

            the.options.width = width;
            the.options.height = height;

            data.each(the.items, function (index, item) {
                attribute.css(item, {
                    width: width,
                    height: height,
                    float: 'left'
                });
            });

            attribute.css(the.ele, {
                position: 'relative',
                left: the.items.length > 3 ? -(the.showIndex + 1) * width : 0,
                width: width * the.items.length,
                height: height
            });

            attribute.css(the.wrap, {
                position: 'relative',
                width: width,
                height: height,
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
            event.un(the.wrap, 'touchstart touchmove touchend touchcancel tap click mouseenter mouseleave');

            // 停止动画
            the.pause();

            data.each(the.items, function (index, item) {
                attribute.css(item, {
                    width: '',
                    height: '',
                    float: ''
                });
            });
            attribute.css(the.ele, {
                width: '',
                height: '',
                left: ''
            });

            // 移除 wrap
            modification.remove(the.nav);
            modification.unwrap(the.ele, 'div');
        }
    });


    /**
     * 实例化一个 slider
     * @param {HTMLElement|Node} ele 元素
     * @param {Object} [options] 配置
     * @param {Number} [options.width=700] slider 宽度，默认700
     * @param {Number} [options.height=300] slider 高度，默认300
     * @param {String} [options.item="li"] slider 项目，默认"li"
     * @param {Number} [options.duration=456] slider 播放动画时间，默认456，单位毫秒
     * @param {String} [options.easing="ease-in-out-back"] slider 播放动画缓冲效果，默认"ease-in-out-back"
     * @param {Number} [options.autoPlay=1] slider 自动播放，1为自动向后播放，-1为自动向前播放，其他为不自动播放
     * @param {String} [options.addClass=""] slider 添加的 className
     * @param {String} [options.navStyle="circle"] slider 导航的样式，内置有"circle"、"square"、"transparent"，如果为空则不显示导航
     * @param {String} [options.navText=""] slider 导航的是否输出导航数字，内置有"number"
     * @param {Function} [options.onchange=noop] slider 改变之后回调，参数为 index
     * @returns {Slider}
     *
     * @example
     * var sld1 = slider(ele, options);
     */
    module.exports = function (ele, options) {
        options = data.extend(!0, {}, defaults, options);

        return (new Slider(ele, options))._init();
    };
});