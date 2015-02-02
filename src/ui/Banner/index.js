/**
 * Banner.js
 * @author ydr.me
 * @create 2015-01-28 20:52
 */


define(function (require, exports, module) {
    /**
     * Banner
     *
     * @module ui/Banner/
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires core/event/touch
     * @requires ui/base
     * @requires util/dato
     * @requires util/typeis
     * @requires util/controller
     */

     "use strict";

    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/touch.js');
    var ui = require('../base.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var controller = require('../../util/controller.js');
    var alienClass = 'alien-ui-banner';
    var alienIndex = 0;
    var defaults = {
        width: 700,
        height: 300,
        itemSelector: 'li',
        axis: '+x',
        addClass: '',
        duration: 345,
        interval: 5000,
        easing: 'ease-out-cubic',
        index: 0,
        minSwipe: 40,
        isAutoPlay: true,
        isLoop: true,
        $navParent: null,
        navGenerator: null
    };
    var Banner = ui.create({
        STATIC: {},
        constructor: function ($list, options) {
            var the = this;

            the._options = dato.extend(true, {}, defaults, options);
            the._$list = selector.query($list)[0];
            the._$items = selector.query(the._options.itemSelector, the._$list);
            the._itemLength = the._$items.length;

            if (the._itemLength <= 1) {
                return the;
            }

            the._init();
        }
    });
    var pro = Banner.prototype;


    /**
     * 初始化
     * @private
     */
    pro._init = function () {
        var the = this;
        var options = the._options;

        the._showIndex = options.index;
        the._direction = options.axis.indexOf('x') > -1 ? 'X' : 'Y';
        the._increase = options.axis.indexOf('-') > -1 ? -1 : 1;
        the._offset = 0;
        the._initNode();
        the.resize(options);
        the._initEvent();
        the._autoPlay(true);

        return the;
    };


    /**
     * 尺寸重置
     * @param [size]
     */
    pro.resize = function (size) {
        var the = this;
        var optons = the._options;

        dato.extend(true, optons, size);

        attribute.css(the._$wrap, {
            position: 'relative',
            overflow: 'hidden',
            width: optons.width,
            height: optons.height
        });

        attribute.css(the._$list, {
            width: the._direction === 'X' ? optons.width * (the._itemLength + 2) : optons.width,
            height: the._direction === 'Y' ? optons.height * (the._itemLength + 2) : optons.height
        });

        dato.each(selector.query(optons.itemSelector, the._$list), function (i, $item) {
            attribute.css($item, {
                float: 'left',
                width: optons.width,
                height: optons.height
            });
        });

        the._translate = -(the._showIndex + 1) * (the._direction === 'X' ? optons.width : optons.height);
        attribute.css(the._$list, the._calTranslate(the._showIndex + 1));
    };


    /**
     * 初始化节点
     * @private
     */
    pro._initNode = function () {
        var the = this;
        var $item0 = the._$items[0];
        var $item_ = the._$items[the._itemLength - 1];
        var options = the._options;
        var html = '';
        var $item0Clone = $item0.cloneNode(true);
        var $item_Clone = $item_.cloneNode(true);

        modification.insert($item0Clone, $item_, 'afterend');
        modification.insert($item_Clone, $item0, 'beforebegin');
        modification.wrap(the._$list, '<div/>');
        the._$wrap = selector.parent(the._$list)[0];
        the._$wrap.id = alienClass + '-' + alienIndex++;
        attribute.addClass(the._$wrap, options.addClass);
        the._$navParent = selector.query(options.$navParent)[0];
        the._$item0Clone = $item0Clone;
        the._$item_Clone = $item_Clone;

        if (the._$navParent && typeis.function(options.navGenerator)) {
            dato.each(the._$items, function (index) {
                html += options.navGenerator.call(the, index, the._itemLength);
            });
            the._$navParent.innerHTML = html;
            the.$navItems = selector.children(the._$navParent);
        }
    };


    /**
     * 初始化事件
     * @private
     */
    pro._initEvent = function () {
        var the = this;
        var options = the._options;
        var hasScroll = false;
        var translate0;

        // 鼠标移入
        event.on(the._$wrap, 'mouseenter', the._autoPlay.bind(false));

        // 鼠标移开
        event.on(the._$wrap, 'mouseleave', the._autoPlay.bind(true));

        // 触摸开始
        event.on(the._$wrap, 'touch1start', function (eve) {
            hasScroll = false;
            translate0 = the._translate;
            the._autoPlay(false);
        });

        // 触摸过程
        event.on(the._$wrap, 'touch1move', function (eve) {
            var deltaX = eve.alienDetail.deltaX;
            var deltaY = eve.alienDetail.deltaY;
            var changedX = eve.alienDetail.changedX;
            var changedY = eve.alienDetail.changedY;
            var sett = {};

            hasScroll = the._direction === 'X' ?
            deltaX <= deltaY :
            deltaX >= deltaY;

            if (!hasScroll) {
                eve.preventDefault();
                sett['translate' + the._direction] = translate0 + (the._direction === 'X' ? changedX : changedY) + 'px';
                attribute.css(the._$list, sett);
            }
        });

        // 触摸结束
        event.on(the._$wrap, 'touch1end', function (eve) {
            var deltaX = eve.alienDetail.deltaX;
            var deltaY = eve.alienDetail.deltaY;
            var changedX = eve.alienDetail.changedX;
            var changedY = eve.alienDetail.changedY;
            var toIndex = the._showIndex;
            var direction = '';

            if (!hasScroll) {
                if (the._direction === 'X' && deltaX > options.minSwipe) {
                    direction = the._increase > 0 && changedX < 0 || the._increase < 0 && changedX > 0 ?
                        'next' : 'prev';
                    toIndex += changedX < 0 ? 1 : -1;
                    the._offset = changedX;
                } else if (the._direction === 'Y' && deltaY > options.minSwipe) {
                    direction = the._increase > 0 && changedY < 0 || the._increase < 0 && changedY > 0 ?
                        'next' : 'prev';
                    toIndex += changedY < 0 ? 1 : -1;
                    the._offset = changedY;
                }

                toIndex = the._boundIndex(toIndex);
                the._show(toIndex, direction, the._autoPlay.bind(the, true));
            } else {
                the._autoPlay(true);
            }
        });

        controller.nextTick(function () {
            the.emit('change', the._showIndex);
        });
    };


    /**
     * 自动播放
     * @param boolean
     * @private
     */
    pro._autoPlay = function (boolean) {
        var the = this;

        if (!the._options.isAutoPlay) {
            return;
        }

        if (boolean) {
            the.play();
        } else {
            the.pause();
        }
    };


    /**
     * 计算偏移量
     * @param realIndex
     * @returns {{}}
     * @private
     */
    pro._calTranslate = function (realIndex) {
        var the = this;
        var options = the._options;
        var val = the._direction === 'X' ?
        options.width * realIndex :
        options.height * realIndex;

        var sett = {};

        sett['translate' + the._direction] = (-val + the._offset) + 'px';

        return sett;
    };


    /**
     * 展示
     * @param index {Number} 待展示的索引值
     * @param direction {String} 方向
     * @param [callback] {Function} 回调
     * @private
     */
    pro._show = function (index, direction, callback) {
        var the = this;
        var lastIndex = the._itemLength - 1;
        var options = the._options;

        if (
            the._showIndex === 0 && the._increase < 0 && direction === 'next' ||
            the._showIndex === 0 && the._increase > 0 && direction === 'prev'
        ) {
            attribute.css(the._$list, the._calTranslate(the._itemLength + 1));
        } else if (
            the._showIndex === lastIndex && the._increase > 0 && direction === 'next' ||
            the._showIndex === lastIndex && the._increase < 0 && direction === 'prev'
        ) {
            attribute.css(the._$list, the._calTranslate(0));
        }

        the._offset = 0;
        the._translate = -(the._direction === 'X' ? options.width : options.height) * (index + 1);
        animation.animate(the._$list, the._calTranslate(index + 1), {
            duration: options.duration,
            easing: options.easing
        }, function () {
            the._showIndex = index;
            the.emit('change', index);

            if (typeis.function(callback)) {
                callback.call(the);
            }
        });
    };


    /**
     * 边界索引
     * @param index
     * @returns {*}
     * @private
     */
    pro._boundIndex = function (index) {
        var the = this;

        if (index < 0) {
            index = the._itemLength - 1;
        } else if (index >= the._itemLength) {
            index = 0;
        }

        return index;
    };


    /**
     * 上一张
     * @param [callback] {Function} 回调
     */
    pro.prev = function (callback) {
        var the = this;
        var willIndex = the._boundIndex(the._showIndex - the._increase);

        the._show(willIndex, 'prev', callback);

        return the;
    };


    /**
     * 下一张
     * @param [callback] {Function} 回调
     */
    pro.next = function (callback) {
        var the = this;
        var willIndex = the._boundIndex(the._showIndex + the._increase);

        the._show(willIndex, 'next', callback);

        return the;
    };


    /**
     * 动画到某一张
     * @param index
     * @param callback
     * @returns {Banner}
     */
    pro.index = function (index, callback) {
        var the = this;
        var direction = '';
        var lastIndex = the._itemLength - 1;

        index = dato.parseInt(index, 0);

        if (index < 0) {
            index = 0;
        } else if (index > lastIndex) {
            index = lastIndex;
        }

        if (index === the._showIndex) {
            return the;
        }

        if (
            the._showIndex < index && the._increase > 0 ||
            the._showIndex > index && the._increase < 0
        ) {
            direction = 'next';
        } else {
            direction = 'prev';
        }

        the._show(index, direction, callback);

        return the;
    };


    /**
     * 暂停播放
     * @returns {Banner}
     */
    pro.pause = function () {
        var the = this;

        if (the._playTimeID) {
            clearTimeout(the._playTimeID);
        }

        return the;
    };


    /**
     * 开始播放
     * @returns {Banner}
     */
    pro.play = function () {
        var the = this;

        the._playTimeID = setTimeout(function () {
            the.next(the.play);
        }, the._options.interval);

        return the;
    };


    /**
     * 销毁实例
     */
    pro.destroy = function () {
        var the = this;

        the.pause();
        event.un(the._$wrap, 'mouseenter mouseleave touch1start touch1move touch1end');
        modification.remove(the._$item0Clone);
        modification.remove(the._$item_Clone);
        modification.unwrap(the._$list, 'div');
    };


    /**
     * 构建一个 banner，标准的 DOM 结构为：<br>
     *     <code>ul#banner1>li*N</code>
     *
     * @param {HTMLElement|Node} $list banner 列表
     * @param {Object} [options] 配置
     * @param {Number} [options.width=700] banner 宽度，默认700
     * @param {Number} [options.height=300] banner 高度，默认300
     * @param {String} [options.itemSelector="li"] banner 项目选择器，默认"li"
     * @param {String} [options.axis="+x"] banner 播放方向，x为左右，y为上下，+为正右边或正上方
     * @param {String} [options.addClass=""] banner 最外层添加 className
     * @param {Number} [options.duration=345] banner 播放动画时间，单位毫秒
     * @param {Number} [options.interval=5000] banner 自动播放间隔时间
     * @param {String} [options.easing="ease-out-cubic"] banner 播放动画缓冲效果
     * @param {Number} [options.index=0] banner 初始化索引
     * @param {Number} [options.minSwipe=40] banner 触摸过边界多少像素切换
     * @param {Boolean} [options.isAutoPlay=true] banner 自动播放，1为自动向后播放，-1为自动向前播放，其他为不自动播放
     * @param {Boolean} [options.isLoop=true] banner 是否循环
     * @param {null|String|HTMLElement|Node} [options.$navParent=null] banner 导航父级
     * @param {null|Function} [options.navGenerator=null] banner 导航生成器
     */
    module.exports = Banner;
});