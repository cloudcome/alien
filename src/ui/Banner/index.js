/**
 * Banner.js
 * @author ydr.me
 * @create 2014-10-10 22:36
 */

define(function (require, exports, module) {
    /**
     * @module ui/Banner/
     * @requires ui/base
     * @requires core/event/touch
     * @requires core/dom/modification
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/animation
     * @requires util/dato
     * @requires util/typeis
     */
    'use strict';

    var noop = function () {
        // ignore
    };
    var alienIndex = 0;
    var style = require('css!./style.css');
    var ui = require('../base.js');
    var event = require('../../core/event/touch.js');
    var modification = require('../../core/dom/modification.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var alienClass = 'alien-ui-banner';
    var defaults = {
        width: 700,
        height: 300,
        itemSelector: 'li',
        duration: 345,
        timeout: 3456,
        easing: 'ease-out-cubic',
        isAutoPlay: true,
        isLoop: true,
        // 运动方向
        // -x x 轴向左
        // +x x 轴向右
        // -y y 轴向下
        // +y y 轴向上
        axis: '+x',
        // 触摸超过边界多少比例的时候切换
        boundaryRatio: 0.3,
        // 导航生成器
        $navParent: null,
        navGenerator: null,
        navItemSelector: 'li',
        navActiveClass: 'active'
    };

    var Banner = ui.create({
        STATIC: {
            defaults: defaults
        },


        constructor: function (ele, options) {
            var the = this;

            ele = selector.query(ele);

            if (!ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = ele[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._initData();
            the._initNode();
            the._initEvent();
            the._activeNav(0);
            the.resize(the._options);
            the.play();
            setTimeout(function () {
                the.emit('change', 0);
            }, 0);

            return the;
        },


        /**
         * 初始化数据
         * @private
         */
        _initData: function () {
            var the = this;
            var options = the._options;

            the._id = ++alienIndex;
            the._showIndex = 0;
            the._translate = 0;
            the._direction = options.axis.indexOf('x') > -1 ? 'X' : 'Y';
            the._increase = options.axis.indexOf('-') > -1 ? -1 : 1;
            the._distance = 0;
            the._isPrivatePlay = false;
            the._playTimeID = 0;
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var navHTML = '';
            var $cloneStart0;
            var $cloneStart1;
            var $cloneEnd0;
            var $cloneEnd1;

            modification.wrap(the._$ele, '<div class="' + alienClass + '" ' +
            'id="' + alienClass + (alienIndex++) + '">');
            the._$banner = selector.parent(the._$ele)[0];
            the._$items = selector.query(options.itemSelector, the._$ele);

            var length = the._$items.length;
            var $navParent = selector.query(options.$navParent)[0];

            if (typeis.function(options.navGenerator) && $navParent) {
                dato.each(the._$items, function (index) {
                    navHTML += options.navGenerator(index, length);
                });

                $navParent.innerHTML = navHTML;
                the._$navItems = selector.query(options.navItemSelector, $navParent);
            }

            if (the._$items.length > 1) {
                // clone
                $cloneStart0 = the._$items[0].cloneNode(true);
                $cloneStart1 = the._$items[0].cloneNode(true);
                $cloneEnd0 = the._$items[the._$items.length - 1].cloneNode(true);
                $cloneEnd1 = the._$items[the._$items.length - 1].cloneNode(true);

                // addClass
                attribute.addClass($cloneStart0, alienClass + '-clone');
                attribute.addClass($cloneStart1, alienClass + '-clone');
                attribute.addClass($cloneEnd0, alienClass + '-clone');
                attribute.addClass($cloneEnd1, alienClass + '-clone');

                // insert
                modification.insert($cloneEnd0, the._$ele, 'afterbegin');
                modification.insert($cloneStart1, the._$ele, 'afterbegin');
                modification.insert($cloneStart0, the._$ele, 'beforeend');
                modification.insert($cloneEnd1, the._$ele, 'beforeend');
                the._$items.unshift($cloneEnd0);
                the._$items.unshift($cloneStart1);
                the._$items.push($cloneStart0);
                the._$items.push($cloneEnd1);
            }

            the._$clones = [$cloneStart0, $cloneStart1, $cloneEnd0, $cloneEnd1];
            the._$navParent = $navParent;
        },


        /**
         * 切换克隆元素显隐
         * @param isDisplay {Boolean} 是否显示
         * @param [duration] {Number} 动画时间
         * @private
         */
        _toggleClone: function (isDisplay, duration) {
            var the = this;

            if (the._options.isLoop) {
                return;
            }

            var _toggle = function () {
                if (the._toggleTimer) {
                    clearTimeout(the._toggleTimer);
                    the._toggleTimer = 0;
                }

                attribute[(isDisplay ? 'remove' : 'add') + 'Class'](the._$banner, alienClass + '-touch');
            };

            if (isDisplay) {
                the._toggleTimer = setTimeout(_toggle, duration + 30);
            } else {
                _toggle();
            }
        },


        /**
         * 初始化事件监听
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;
            var translate;
            var touch0;
            var touch1;
            // 触摸结束
            var _touchdone = function (duration) {
                the._toggleClone(true, duration);
            };

            // 单击 nav
            if (the._$navParent) {
                event.on(the._$navParent, 'tap click', options.navItemSelector, function () {
                    var index = selector.index(this);

                    the.pause();
                    the.index(index);
                    the.play();
                });
            }

            // 鼠标悬停
            event.on(the._$banner, 'mouseenter', function () {
                the.pause();
            });

            event.on(the._$banner, 'mouseleave', function () {
                the.play();
            });

            // 触摸
            event.on(the._$banner, 'touch1start', function (eve) {
                the._toggleClone(false);
                the.pause();
                translate = the._translate;
                touch0 = eve.alienDetail['start' + the._direction];
            });

            event.on(the._$banner, 'touch1move', function (eve) {
                var changed = eve.alienDetail['changed' + the._direction];

                if (options.isLoop) {
                    var translateChanged = translate + changed;
                    var count = the._$items.length - 4;

                    if (changed > 0 && translateChanged >= the._maxTranslate) {
                        translate = translateChanged - count * the._distance;
                        attribute.css(the._$ele, the._calTranslate(translate, false));
                    } else if (changed < 0 && translateChanged <= the._minTranslate) {
                        translate = translateChanged + count * the._distance;
                        attribute.css(the._$ele, the._calTranslate(translate, false));
                    }
                }

                attribute.css(the._$ele, the._calTranslate(translate + changed, false));
                eve.preventDefault();
            });

            event.on(the._$banner, 'touch1end', function (eve) {
                touch1 = touch1 || touch0;

                var changed = eve.alienDetail['changed' + the._direction];
                var translateChanged = translate + changed;

                if (!changed) {
                    _touchdone(-30);
                    the.play();
                    return;
                }

                var index = the._getIndex(changed, translateChanged);
                var type = changed < 0 && the._increase > 0 || changed > 0 && the._increase < 0 ? 'next' : 'prev';
                var touchEasing = 'linear';
                var remainDuration = the._calDuration(index, translateChanged);

                if (index === the._showIndex) {
                    animation.animate(the._$ele, the._calTranslate(the._translate), {
                        duration: 234,
                        easing: touchEasing
                    });
                    _touchdone(234);
                } else {
                    the._index(type, index, noop, {
                        duration: remainDuration,
                        easing: touchEasing
                    });
                    _touchdone(remainDuration);
                }

                the.play();
            });
        },


        /**
         * 计算偏移量
         * @param val {Number} 设置值
         * @param [isOverWrite=true] {Boolean} 是否覆盖
         * @private
         */
        _calTranslate: function (val, isOverWrite) {
            var the = this;
            var sett = {};

            if (isOverWrite !== false) {
                the._translate = val;
            }

            sett['translate' + the._direction] = val + 'px';

            return sett;
        },


        /**
         * 计算剩余便宜动画时间
         * @param index {Number} 显示的索引值
         * @param distance {Number} 滑动的距离
         * @private
         */
        _calDuration: function (index, distance) {
            var the = this;
            var options = the._options;
            var delta = the._distance * (index + 2) + distance;
            var ratio = delta / the._distance;
            var duration = options.duration * ratio;

            return Math.abs(duration > options.duration ? options.duration : duration);
        },


        /**
         * 根据当前宽度计算索引值
         * @returns order
         * @returns distance
         * @returns {number}
         * @private
         */
        _getIndex: function (order, distance) {
            var the = this;
            var options = the._options;
            var ratio;

            distance = Math.abs(distance);
            distance -= the._distance * 2;

            // 左尽头
            if (distance <= 0) {
                return 0;
            }
            // 右尽头
            else if (distance >= the._distance * (the._$items.length - 5)) {
                return the._$items.length - 5;
            }
            // 中间
            else {
                ratio = distance % the._distance / the._distance;

                if (order > 0) {
                    ratio = 1 - ratio;
                }

                return Math[order > 0 ? 'ceil' : 'floor'](distance / the._distance) +
                    (ratio > options.boundaryRatio ? (order > 0 ? -1 : 1) : 0);
            }
        },


        /**
         * 重置尺寸
         * @param {Object} size  尺寸对象
         * @param {Number} [size.width]  宽度
         * @param {Number} [size.height]  高度
         */
        resize: function (size) {
            var the = this;
            var options = the._options;
            var sett;
            var width;
            var height;
            var count = the._$items.length - 4;

            options.width = size.width || options.width;
            options.height = size.height || options.height;
            width = options.width * (the._direction === 'X' ? the._$items.length : 1);
            height = options.height * (the._direction === 'Y' ? the._$items.length : 1);
            the._distance = the._direction === 'X' ? options.width : options.height;
            the._maxTranslate = count > 1 ? -2 * the._distance : 0
            the._minTranslate = count > 1 ? -(count + 1) * the._distance : 0
            sett = the._calTranslate(count > 1 ? -(the._showIndex + 2) * the._distance : 0);

            dato.extend(true, sett, {
                position: 'relative',
                width: width,
                height: height
            });

            dato.each(the._$items, function (index, item) {
                attribute.css(item, {
                    position: 'relative',
                    width: options.width,
                    height: options.height,
                    float: 'left',
                    overflow: 'hidden'
                });
            });
            attribute.css(the._$ele, sett);
            attribute.css(the._$banner, {
                position: 'relative',
                width: options.width,
                height: options.height,
                overflow: 'hidden'
            });

            return the;
        },


        /**
         * 运动前的索引值计算
         * @param {Number} move -1：反序，1：正序
         * @param {Number} showIndex 要展示的索引
         * @private
         */
        _beforeShowIndex: function (move, showIndex) {
            var the = this;
            var length = the._$items.length;

            // ++
            if (the._increase > 0 && move === 1 ||
                the._increase < 0 && move === -1) {
                showIndex = showIndex === length - 5 ? 0 : showIndex + 1;
            }
            // --
            else {
                showIndex = showIndex === 0 ? length - 5 : showIndex - 1;
            }

            return showIndex;
        },


        /**
         * 显示之前的定位与计算下一帧的位置
         * @param type {String} 动作类型
         * @param _showIndex {Number} 要显示的索引值
         * @private
         */
        _beforeDisplayIndex: function (type, _showIndex) {
            var the = this;
            var length = the._$items.length;
            var count = length - 4;
            var $ele = the._$ele;
            var distance = the._distance;
            var isPlusPlus = the._increase < 0 && type === 'prev' ||
                the._increase > 0 && type === 'next';
            var isMinusMinus = the._increase < 0 && type === 'next' ||
                the._increase > 0 && type === 'prev';

            if (isPlusPlus && _showIndex === 0) {
                attribute.css($ele, the._calTranslate(-1 * distance));
            } else if (isMinusMinus && _showIndex === count - 1) {
                attribute.css($ele, the._calTranslate(-(count + 2) * distance));
            }
        },


        /**
         * 高亮导航
         * @param index
         * @private
         */
        _activeNav: function (index) {
            var the = this;

            if (the._$navItems) {
                dato.each(the._$navItems, function (_index, $item) {
                    attribute[(index === _index ? 'add' : 'remove') + 'Class']($item, 'active');
                });
            }
        },


        /**
         * 播放第几个项目
         * @param {Number} index 需要展示的序号
         * @param {Function} [callback] 回调
         */
        index: function (index, callback) {
            var the = this;
            var type = the._increase > 0 ?
                (the._showIndex > index ? 'prev' : 'next') :
                (the._showIndex < index ? 'prev' : 'next');
            var length = the._$items.length;
            var count = length - 4;

            if (the._options.isLoop) {
                if (count - 1 === the._showIndex && index === 0) {
                    type = the._increase > 0 ? 'next' : 'prev';
                } else if (the._showIndex === 0 && index === count - 1) {
                    type = the._increase > 0 ? 'prev' : 'next';
                }
            } else {
                type = index > the._showIndex ?
                    (the._increase > 0 ? 'next' : 'prev') :
                    (the._increase > 0 ? 'prev' : 'next');
            }

            the._index(type, index, callback);

            return the;
        },


        /**
         * 播放第几个项目
         * @param {String} type 展示方式
         * @param {Number} index 需要展示的序号
         * @param {Function} callback 回调
         * @param {Object} [otp] 额外参数
         * @private
         */
        _index: function (type, index, callback, otp) {
            var the = this;
            var options = dato.extend(true, {}, the._options, otp);
            var count = the._$items.length - 2;
            var sett;

            if (count < 2 || index === the._showIndex) {
                return the;
            }

            if (!otp || !options.isLoop) {
                the._beforeDisplayIndex(type, index);
            }

            if (index >= count) {
                throw new Error('can not go to ' + type + ' ' + index);
            }

            if (!typeis.function(callback)) {
                callback = noop;
            }

            sett = the._calTranslate(-the._distance * (index + 2));

            animation.animate(the._$ele, sett, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                the._activeNav(index);
                the.emit('change', index);
                the._showIndex = index;

                callback.call(the);
            });
        },


        /**
         * 播放到上一个项目
         * @param {Function} [callback] 回调
         */
        prev: function (callback) {
            var the = this;
            var showIndex = the._showIndex;
            var type = 'prev';

            if (the._$items.length < 4) {
                return the;
            }

            if (!the._options.isLoop && showIndex === 0) {
                type = 'next';
            }

            the.pause();
            showIndex = the._beforeShowIndex(-1, showIndex);
            the._index(type, showIndex, callback);
            the.play();

            return the;
        },


        /**
         * 播放到下一个项目
         * @param {Function} [callback] 回调
         */
        next: function (callback) {
            var the = this;
            var showIndex = the._showIndex;
            var type = 'next';

            if (the._$items.length < 4) {
                return the;
            }

            if (!the._options.isLoop && showIndex === the._$items.length - 5) {
                type = 'prev';
            }

            the.pause();
            showIndex = the._beforeShowIndex(1, showIndex);
            the._index(type, showIndex, callback);
            the.play();

            return the;
        },


        /**
         * 自动播放
         */
        play: function () {
            var the = this;
            var options = the._options;

            if (the._$items.length < 4 || !options.isAutoPlay) {
                return the;
            }

            the._clear();
            the._playTimeID = setTimeout(function () {
                the.next();
                the.play();
            }, options.timeout);

            return the;
        },


        /**
         * 清除播放定时器
         * @private
         */
        _clear: function () {
            var the = this;

            if (the._playTimeID) {
                clearTimeout(the._playTimeID);
                the._playTimeID = 0;
            }
        },


        /**
         * 暂停动画
         */
        pause: function () {
            var the = this;

            if (the._$items.length < 4) {
                return the;
            }

            the._clear();

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;
            var set = the._calTranslate(0);

            dato.extend(set, {
                position: '',
                overflow: '',
                width: '',
                height: ''
            });

            // 移除所有事件
            event.un(the._$banner, 'touch1start touch1move touch1end tap click mouseenter mouseleave');
            event.un(the._$navParent, 'tap click');

            // 停止动画
            the.pause();

            dato.each(the._$items, function (index, item) {
                attribute.css(item, {
                    position: '',
                    overflow: '',
                    width: '',
                    height: '',
                    float: ''
                });
            });
            attribute.css(the._$ele, set);
            modification.insert(the._$ele, the._$banner, 'afterend');
            dato.each(the._$clones, function (index, $clone) {
                modification.remove($clone);
            });
            modification.remove(the._$banner);
        }
    });


    /**
     * 构建一个 banner，标准的 DOM 结构为：<br>
     *     <code>ul#banner1>li*N</code>
     *
     * @param {HTMLElement|Node} ele 元素
     * @param {Object} [options] 配置
     * @param {Number} [options.width=700] banner 宽度，默认700
     * @param {Number} [options.height=300] banner 高度，默认300
     * @param {String} [options.itemSelector="li"] banner 项目，默认"li"
     * @param {Number} [options.duration=456] banner 播放动画时间，默认456，单位毫秒
     * @param {String} [options.easing="ease-in-out-back"] banner 播放动画缓冲效果，默认"ease-in-out-back"
     * @param {Boolean} [options.isAutoPlay=true] banner 自动播放，1为自动向后播放，-1为自动向前播放，其他为不自动播放
     * @param {String} [options.axis="+x"] banner 播放方向，x为左右，y为上下，+为正右边或正上方
     * @param {Number} [options.boundaryRatio=0.3] banner 触摸过边界多少比例切换到下一张
     * @param {null|String|HTMLElement|Node} [options.$navParent=null] banner 导航父级
     * @param {null|Function} [options.navGenerator=null] banner 导航生成器
     * @param {String} [options.navItemSelector="li"] banner 导航项目选择器
     * @param {String} [options.navActiveClass="active"] banner 导航项目高亮类
     */
    module.exports = Banner;
    modification.importStyle(style);
});