/*!
 * index.js
 * @author ydr.me
 * @create 2014-10-06 16:11
 */


define(function (require, exports, module) {
    /**
     * @TODO 模拟滚动条，不占用内容区的原生滚动条使用原生滚动条，占用内容区的原生滚动条就模拟
     * @module ui/scrollbar/index
     * @requires util/data
     * @requires util/class
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/dom/selector
     * @requires core/dom/animation
     * @requires core/event/wheel
     * @requires ui/drag/index
     * @requires ui/scrollbar/style
     */
    'use strict';

    require('./style.js');
    var data = require('../../util/data.js');
    var klass = require('../../util/class.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var selector = require('../../core/dom/selector.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/wheel.js');
    var drag = require('../drag/index.js');
    var defaults = {
        width: 700,
        height: 300,
        minX: 30,
        minY: 30,
        axis: 'y',
        speed: 100,
        duration: 123,
        easing: 'ease-in-out-back'
    };
    var bodyClass = 'alien-ui-scrollbar-body';
    var trackXClass = 'alien-ui-scrollbar-track-x';
    var trackYClass = 'alien-ui-scrollbar-track-y';
    var thumbXClass = 'alien-ui-scrollbar-thumb-x';
    var thumbYClass = 'alien-ui-scrollbar-thumb-y';
    // var trackActiveClass = 'alien-ui-scrollbar-track-active';
    var thumbActiveClass = 'alien-ui-scrollbar-thumb-active';
    // @link http://en.wikipedia.org/wiki/DOM_events#Common.2FW3C_events
    // var updateEvent = 'DOMSubtreeModified DOMNodeInserted DOMNodeRemoved DOMNodeRemovedFromDocument DOMNodeInsertedIntoDocument DOMAttrModified DOMCharacterDataModified';
    // 这里不能用 DOMSubtreeModified，会导致IE卡死
    var updateEvent = ' DOMNodeInserted DOMNodeRemoved DOMNodeRemovedFromDocument DOMNodeInsertedIntoDocument DOMAttrModified DOMCharacterDataModified';
    var isPlaceholderScroll = _isPlaceholderScroll();
    var Scrollbar = klass.create({
        constructor: function (ele, options) {
            var the = this;

            the.ele = ele;
            the.options = options;

            if (data.type(options.width) !== 'number' || data.type(options.height) !== 'number') {
                throw new Error('scrollbar require width and height px value');
            }
        },

        /**
         * 初始化
         * @returns {Scrollbar}
         * @private
         */
        _init: function () {
            var the = this;
            var options = the.options;
            var wrap;

            if(!isPlaceholderScroll){
                // 内容区域的尺寸
                the.scrollLeft = 0;
                the.scrollTop = 0;
                // 滚动条的尺寸关系
                the.xLeft = 0;
                the.xLeftMax = 0;
                the.xWidth = 0;
                the.xOffset = 0;
                the.yTop = 0;
                the.yTopMax = 0;
                the.yHeight = 0;
                the.yOffset = 0;

                return the;
            }

            wrap = modification.wrap(the.ele, '<div class="alien-ui-scrollbar">' +
                '<div class="' + bodyClass + '"></div>' +
                // wrap 插入的是第一个最底层元素里 ^️
                '<div class="alien-ui-scrollbar-track ' + trackXClass + '"><div class="alien-ui-scrollbar-thumb ' + thumbXClass + '"></div></div>' +
                '<div class="alien-ui-scrollbar-track ' + trackYClass + '"><div class="alien-ui-scrollbar-thumb ' + thumbYClass + '"></div></div>' +
                '</div>')[0];

            the.animateOptions = {
                duration: options.duration,
                easing: options.easing
            };
            the.wrap = wrap;
            the.body = selector.query('.' + bodyClass, wrap)[0];
            the.trackX = selector.query('.' + trackXClass, wrap)[0];
            the.trackY = selector.query('.' + trackYClass, wrap)[0];
            the.thumbX = selector.query('.' + thumbXClass, wrap)[0];
            the.thumbY = selector.query('.' + thumbYClass, wrap)[0];
            // 内容区域的尺寸
            the.scrollLeft = 0;
            the.scrollTop = 0;
            // 滚动条的尺寸关系
            the.xLeft = 0;
            the.xLeftMax = 0;
            the.xWidth = 0;
            the.xOffset = the.thumbX.offsetLeft * 2;
            the.yTop = 0;
            the.yTopMax = 0;
            the.yHeight = 0;
            the.yOffset = the.thumbY.offsetTop * 2;

            the.update({
                width: attribute.width(the.ele),
                height: attribute.height(the.ele)
            });

            the._event();

            return the;
        },


        /**
         * 重置尺寸，当前区域或者内容尺寸变化时
         * @private
         */
        _resize: function () {
            var the = this;
            var options = the.options;

            // 计算滚动条的x轴的宽、y轴的高
            the.xWidth = (options.width - the.xOffset) * options.width / the.scrollWidth;

            if (the.xWidth < options.minX) {
                the.xWidth = options.minX;
            }

            the.yHeight = (options.height - the.yOffset) * options.height / the.scrollHeight;

            if (the.yHeight < options.minY) {
                the.yHeight = options.minY;
            }

            the.xLeftMax = options.width - the.xOffset - the.xWidth;
            the.yTopMax = options.height - the.yOffset - the.yHeight;

            animation.animate(the.thumbX, {
                width: the.xWidth
            }, the.animateOptions);

            animation.animate(the.thumbY, {
                height: the.yHeight
            }, the.animateOptions);
        },


        /**
         * 事件监听
         * @private
         */
        _event: function () {
            var the = this;
            var options = the.options;
            var thumb = options.axis === 'y' ? the.thumbY : the.thumbX;
            var key = options.axis === 'y' ? 'Top' : 'Left';
            var x0;
            var left0;
            var y0;
            var top0;

            // 更新内容尺寸
            event.on(the.wrap, updateEvent, function () {
                the.update();
            });


            // 鼠标滚动
            event.on(the.wrap, 'wheelstart', function () {
                attribute.addClass(thumb, thumbActiveClass);
            });

            event.on(the.wrap, 'wheelchange', function (eve) {
                var y = eve.alienDetail.deltaY;
                var d = -y * options.speed;

                the['scroll' + key] += d;
                the['scroll' + options.axis.toUpperCase()]();
            });

            event.on(the.wrap, 'wheelend', function () {
                attribute.removeClass(thumb, thumbActiveClass);
            });

            // 拖拽支持
            the.dragX = drag(the.thumbX, {
                isClone: !1,
                axis: 'x',
                ondragstart: function (eve) {
                    x0 = eve.pageX;
                    left0 = parseFloat(attribute.css(the.thumbX, 'left'));
                    attribute.addClass(the.thumbX, thumbActiveClass);
                },
                ondrag: function (eve) {
                    var left = left0 + eve.pageX - x0;
                    var ratio;

                    if (left < 0) {
                        left = 0;
                    } else if (left > the.xLeftMax) {
                        left = the.xLeftMax;
                    }

                    ratio = left / (options.width - the.xWidth - the.xOffset);
                    the.xLeft = left;
                    the.scrollLeft = (the.scrollWidth - options.width) * ratio;

                    attribute.css(the.body, 'left', -the.scrollLeft);
                    attribute.css(the.thumbX, 'left', left);

                    return !1;
                },
                ondragend: function () {
                    attribute.removeClass(the.thumbX, thumbActiveClass);
                }
            });

            the.dragY = drag(the.thumbY, {
                isClone: !1,
                axis: 'y',
                ondragstart: function (eve) {
                    y0 = eve.pageY;
                    top0 = parseFloat(attribute.css(the.thumbY, 'top'));
                    attribute.addClass(the.thumbY, thumbActiveClass);
                },
                ondrag: function (eve) {
                    var top = top0 + eve.pageY - y0;
                    var ratio;

                    if (top < 0) {
                        top = 0;
                    } else if (top > the.yTopMax) {
                        top = the.yTopMax;
                    }

                    ratio = top / (options.height - the.yHeight - the.yOffset);
                    the.yTop = top;
                    the.scrollTop = (the.scrollHeight - options.height) * ratio;

                    attribute.css(the.body, 'top', -the.scrollTop);
                    attribute.css(the.thumbY, 'top', top);

                    return !1;
                },
                ondragend: function () {
                    attribute.removeClass(the.thumbY, thumbActiveClass);
                }
            });
        },


        /**
         * x 轴滚动
         * @param {Number} [x] 滚动的位置，相对于框架，默认为当前值，常用来重新定位当前滚动条
         * @returns {Scrollbar}
         */
        scrollX: function (x) {
            var the = this;
            var options = the.options;
            var width = the.scrollWidth - options.width;
            var track = options.width - the.xWidth - the.xOffset;

            if (x) {
                if (x < 0) {
                    x = 0;
                } else if (x > width) {
                    x = width;
                }

                the.scrollLeft = x;
            }

            if (the.scrollLeft > width) {
                the.scrollLeft = width;
            } else if (the.scrollLeft < 0) {
                the.scrollLeft = 0;
            }

            attribute.css(the.body, {
                left: -the.scrollLeft
            });
            attribute.css(the.thumbX, {
                left: the.xLeft = track * the.scrollLeft / width
            });

            return the;
        },


        /**
         * y 轴滚动
         * @param {Number} [y] 滚动的位置，相对于框架，默认为当前值，常用来重新定位当前滚动条
         * @returns {Scrollbar}
         */
        scrollY: function (y) {
            var the = this;
            var options = the.options;
            var height = the.scrollHeight - options.height;
            var track = options.height - the.yHeight - the.yOffset;

            if (y) {
                if (y < 0) {
                    y = 0;
                } else if (y > height) {
                    y = height;
                }

                the.scrollTop = y;
            }

            if (the.scrollTop > height) {
                the.scrollTop = height;
            } else if (the.scrollTop < 0) {
                the.scrollTop = 0;
            }

            attribute.css(the.body, {
                top: -the.scrollTop
            });
            attribute.css(the.thumbY, {
                top: the.yTop = track * the.scrollTop / height
            });

            return the;
        },


        /**
         * 更新当前内容尺寸
         * @param {Object} [size] 包含 width 和 height 的键值对
         * @returns {Scrollbar}
         */
        update: function (size) {
            var the = this;

            size = size || {};
            the.scrollWidth = size.width || attribute.width(the.ele);
            the.scrollHeight = size.height || attribute.height(the.ele);
            the.resize(the.options);

            return the;
        },


        /**
         * 更新当前框架尺寸
         * @param {Object} [size] 包含 width 和 height 的键值对
         * @returns {Scrollbar}
         */
        resize: function (size) {
            var the = this;
            var options = the.options;

            if (data.type(size) !== 'object') {
                return the;
            }

            data.extend(options, {
                width: size.width,
                height: size.height
            });

            animation.animate(the.wrap, {
                width: options.width,
                height: options.height
            }, the.animateOptions);

            the._resize();
            the.scrollX();
            the.scrollY();

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            // 清除拖拽
            the.dragX.destroy();
            the.dragY.destroy();

            // 清除监听
            event.un(the.wrap, updateEvent);
            event.un(the.wrap, 'wheelchange');
            event.un(the.wrap, 'wheelend');

            // unwrap
            modification.remove(the.trackX);
            modification.remove(the.trackY);
            modification.unwrap(the.ele, 'div div');
        }
    });

    /**
     * 实例化一个自定义滚动条
     * @param ele
     * @param options
     * @returns {Scrollbar}
     */
    module.exports = function (ele, options) {
        options = data.extend(!0, {}, defaults, options);

        return (new Scrollbar(ele, options))._init();
    };


    /**
     * 判断是否为占位（占用内容区域）的滚动条
     * 这通常是非手机浏览器
     * @return {Boolean}
     */
    function _isPlaceholderScroll() {
        // 在 iframe 里操作的原因是，滚动条可以被样式修改，防止样式修改导致滚动条判断不正确
        var iframe = modification.create('iframe', {
            src: 'javascript:;'
        });
        var div;
        var clientWidth;
        var iframeDocument;

        modification.insert(iframe, document.body, 'beforeend');
        iframeDocument = selector.contents(iframe)[0];
        iframeDocument.write('<!DOCTYPE html><html><body><div></div></body></html>');
        iframeDocument.close();

        div = selector.query('div', iframeDocument)[0];

        attribute.css(div, {
            width: 100,
            height: 100,
            position: 'absolute',
            padding: 0,
            margin: 0,
            overflow: 'scroll'
        });

        clientWidth = div.clientWidth;

        // 防止触发 IE 没有权限的 BUG
        // http://netease.aliapp.com/bug/document.html
        attribute.css(iframe, 'display', 'none');
        return clientWidth < 100;
    }
});