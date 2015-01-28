/**
 * Banner.js
 * @author ydr.me
 * @create 2015-01-28 20:52
 */


define(function (require, exports, module) {
    "use strict";

    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/touch.js');
    var ui = require('../base.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var control = require('../../util/control.js');
    var alienClass = 'alien-ui-banner';
    var alienIndex = 0;
    var defaults = {
        width: 300,
        height: 200,
        itemSelector: 'li',
        axis: '+x',
        addClass: '',
        duration: 345,
        easing: 'ease-out-cubic',
        interval: 5000,
        index: 0,
        isAutoPlay: true,
        isLoop: true,
        $navParent: null,
        navGenerator: null,
        navSelector: 'li',
        navActiveClass: 'active'
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
        the._initNode();
        the.resize(options);
        the._initEvent();

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
            width: optons.width * (the._itemLength + 2),
            height: optons.height * (the._itemLength + 2)
        });

        dato.each(selector.query(optons.itemSelector, the._$list), function (i, $item) {
            attribute.css($item, {
                float: 'left',
                width: optons.width,
                height: optons.height
            });
        });

        the._translate = (the._showIndex + 2) * optons.width;
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

        modification.insert($item0.cloneNode(true), $item_, 'afterend');
        modification.insert($item_.cloneNode(true), $item0, 'beforebegin');
        modification.wrap(the._$list, '<div/>');
        the._$wrap = selector.parent(the._$list)[0];
        the._$wrap.id = alienClass + '-' + alienIndex++;
        attribute.addClass(the._$wrap, options.addClass);
        the._$navParent = selector.query(options.$navParent)[0];

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

        control.nextTick(function () {
            the.emit('change', the._showIndex);
        });
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

        sett['translate' + the._direction] = -val + 'px';

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
        var args = arguments;

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

        the._translate = options.width * (index + 1);
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


    module.exports = Banner;
});