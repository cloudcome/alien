/*!
 * Scrollbar.js
 * @author ydr.me
 * @create 2014-10-10 22:37
 */


define(function (require, exports, module) {
    /**
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

    var data = require('../util/data.js');
    var klass = require('../util/class.js');
    var Emitter = require('../libs/Emitter.js');
    var modification = require('../core/dom/modification.js');
    var attribute = require('../core/dom/attribute.js');
    var selector = require('../core/dom/selector.js');
    var animation = require('../core/dom/animation.js');
    var event = require('../core/event/wheel.js');
    var Drag = require('./Drag.js');
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
    var noop = function () {
        // ignore
    };
    var defaults = {
        width: 700,
        height: 300,
        minX: 30,
        minY: 30,
        axis: 'y',
        speed: 100,
        duration: 456,
        cssEasing: 'in-out',
        jsEasing: 'swing'
    };
    var Scrollbar = klass.create({
        STATIC: {
            defaults: defaults
        },


        constructor: function (ele, options) {
            var the = this;


            the._ele = selector.query(ele);

            if(!the._ele.length){
                throw new Error('instance element is empty');
            }

            the._ele = the._ele[0];
            Emitter.apply(the, arguments);
            the._options = data.extend(!0, {}, defaults, options);
            the._init();
        },

        /**
         * 初始化
         * @returns {Scrollbar}
         */
        init: function () {
            var the = this;
            var options = the._options;
            var wrap;

            if (data.type(options.width) !== 'number' || data.type(options.height) !== 'number') {
                throw new Error('scrollbar require width and height px value');
            }

            options.easing = isPlaceholderScroll ? options.cssEasing : options.jsEasing;

            if (isPlaceholderScroll) {
                wrap = modification.wrap(the._ele, '<div class="alien-ui-scrollbar">' +
                    '<div class="' + bodyClass + '"></div>' +
                    // wrap 插入的是第一个最底层元素里 ^️
                    '<div class="alien-ui-scrollbar-track ' + trackXClass + '"><div class="alien-ui-scrollbar-thumb ' + thumbXClass + '"></div></div>' +
                    '<div class="alien-ui-scrollbar-track ' + trackYClass + '"><div class="alien-ui-scrollbar-thumb ' + thumbYClass + '"></div></div>' +
                    '</div>')[0];

                the._animateOptions = {
                    duration: options.duration,
                    easing: options.easing
                };

                the._body = selector.query('.' + bodyClass, wrap)[0];
                the._trackX = selector.query('.' + trackXClass, wrap)[0];
                the._trackY = selector.query('.' + trackYClass, wrap)[0];
                the._thumbX = selector.query('.' + thumbXClass, wrap)[0];
                the._thumbY = selector.query('.' + thumbYClass, wrap)[0];
                the._xOffset = the._thumbX.offsetLeft * 2;
                the._yOffset = the._thumbY.offsetTop * 2;
            } else {
                wrap = modification.wrap(the._ele, '<div class="alien-ui-scrollbar"/>')[0];
                the._xOffset = 0;
                the._yOffset = 0;

                attribute.css(wrap, {
                    'overflow-scrolling': 'touch',
                    overflow: 'auto'
                });
            }

            the._wrap = wrap;
            // 内容区域的尺寸
            the._scrollLeft = 0;
            the._scrollTop = 0;
            // 滚动条的尺寸关系
            the._xLeft = 0;
            the._xLeftMax = 0;
            the._xWidth = 0;
            the._yTop = 0;
            the._yTopMax = 0;
            the._yHeight = 0;
            the._isWheel = !1;

            the.update({
                width: attribute.width(the._ele),
                height: attribute.height(the._ele)
            });

            the._event();
            return the;
        },


        /**
         * 重置尺寸，当前区域或者内容尺寸变化时
         * @private
         */
        _resize: function () {
            if (!isPlaceholderScroll) {
                return this;
            }

            var the = this;
            var options = the._options;

            // 计算滚动条的x轴的宽、y轴的高
            the._xWidth = (options.width - the._xOffset) * options.width / the._scrollWidth;

            if (the._xWidth < options.minX) {
                the._xWidth = options.minX;
            }

            the._yHeight = (options.height - the._yOffset) * options.height / the._scrollHeight;

            if (the._yHeight < options.minY) {
                the._yHeight = options.minY;
            }

            the._xLeftMax = options.width - the._xOffset - the._xWidth;
            the._yTopMax = options.height - the._yOffset - the._yHeight;

            animation.animate(the._thumbX, {
                width: the._xWidth
            }, the._animateOptions);

            animation.animate(the._thumbY, {
                height: the._yHeight
            }, the._animateOptions);
        },


        /**
         * 事件监听
         * @private
         */
        _event: function () {
            var the = this;
            var options = the._options;
            var thumb = options.axis === 'y' ? the._thumbY : the._thumbX;
            var key = options.axis === 'y' ? 'Top' : 'Left';
            var x0;
            var left0;
            var y0;
            var top0;

            if (isPlaceholderScroll) {
                // 更新内容尺寸
                event.on(the._wrap, updateEvent, function () {
                    the.update();
                });


                // 鼠标滚动
                event.on(the._wrap, 'wheelstart', function () {
                    attribute.addClass(thumb, thumbActiveClass);
                    the._isWheel = !0;
                });

                event.on(the._wrap, 'wheelchange', function (eve) {
                    var y = eve.alienDetail.deltaY;
                    var d = -y * options.speed;

                    animation.stop(the._wrap);
                    the['_scroll' + key] += d;
                    the['scroll' + options.axis.toUpperCase()]();
                });

                event.on(the._wrap, 'wheelend', function () {
                    the._isWheel = !1;
                    attribute.removeClass(thumb, thumbActiveClass);
                });

                // 拖拽支持
                the._dragX = new Drag(the._thumbX, {
                    isClone: !1,
                    axis: 'x',
                    preventDefault: !0
                })
                    .init()
                    .on('dragstart', function (eve) {
                        x0 = eve.pageX;
                        left0 = parseFloat(attribute.css(the._thumbX, 'left'));
                        attribute.addClass(the._thumbX, thumbActiveClass);
                    })
                    .on('drag', function (eve) {
                        var left = left0 + eve.pageX - x0;
                        var ratio;

                        if (left < 0) {
                            left = 0;
                        } else if (left > the._xLeftMax) {
                            left = the._xLeftMax;
                        }

                        ratio = left / (options.width - the._xWidth - the._xOffset);
                        the._xLeft = left;
                        the._scrollLeft = (the._scrollWidth - options.width) * ratio;

                        attribute.css(the._body, 'left', -the._scrollLeft);
                        attribute.css(the._thumbX, 'left', left);
                        the.emit('changex', the._scrollLeft);

                        return !1;
                    })
                    .on('dragend', function (eve) {
                        attribute.removeClass(the._thumbX, thumbActiveClass);
                    });

                the._dragY = new Drag(the._thumbY, {
                    isClone: !1,
                    axis: 'y',
                    preventDefault: !0
                })
                    .init()
                    .on('dragstart', function (eve) {
                        y0 = eve.pageY;
                        top0 = parseFloat(attribute.css(the._thumbY, 'top'));
                        attribute.addClass(the._thumbY, thumbActiveClass);
                    })
                    .on('drag', function (eve) {
                        var top = top0 + eve.pageY - y0;
                        var ratio;

                        if (top < 0) {
                            top = 0;
                        } else if (top > the._yTopMax) {
                            top = the._yTopMax;
                        }

                        ratio = top / (options.height - the._yHeight - the._yOffset);
                        the._yTop = top;
                        the._scrollTop = (the._scrollHeight - options.height) * ratio;

                        attribute.css(the._body, 'top', -the._scrollTop);
                        attribute.css(the._thumbY, 'top', top);
                        the.emit('changey', the._scrollTop);

                        return !1;
                    })
                    .on('dragend', function () {
                        attribute.removeClass(the._thumbY, thumbActiveClass);
                    });
            } else {
                event.on(the._wrap, 'scroll', function () {
                    if (the._scrollLeft !== the._wrap.scrollLeft) {
                        the._scrollLeft = the._wrap.scrollLeft;
                        the.emit('changex', the._scrollLeft);
                    }

                    if (the._scrollTop !== the._wrap.scrollTop) {
                        the._scrollTop = the._wrap.scrollTop;
                        the.emit('changey', the._scrollTop);
                    }
                });
            }
        },


        /**
         * x 轴滚动
         * @param {Number} [x] 滚动的位置，相对于框架，默认为当前值，常用来重新定位当前滚动条
         * @returns {Scrollbar}
         */
        scrollX: function (x) {
            var the = this;
            var options = the._options;
            var maxScrollWidth = the._scrollWidth - options.width;
            var track = options.width - the._xWidth - the._xOffset;

            if (arguments.length) {
                x = data.parseFloat(x, 0);

                if (x < 0 || x > maxScrollWidth) {
                    x = maxScrollWidth;
                }

                the._scrollLeft = x;
            }

            if (the._scrollLeft > maxScrollWidth) {
                the._scrollLeft = maxScrollWidth;
            } else if (the._scrollLeft < 0) {
                the._scrollLeft = 0;
            }

            if (isPlaceholderScroll) {
                if (the._isWheel) {
                    attribute.css(the._body, {
                        left: -the._scrollLeft
                    });
                    attribute.css(the._thumbX, {
                        left: the._xLeft = track * the._scrollLeft / maxScrollWidth
                    });
                } else {
                    animation.animate(the._body, {
                        left: -the._scrollLeft
                    }, the._animateOptions);
                    animation.animate(the._thumbX, {
                        left: the._xLeft = track * the._scrollLeft / maxScrollWidth
                    }, the._animateOptions);
                }
            } else {
                animation.scrollTo(the._wrap, {
                    x: the._scrollLeft,
                    y: the._scrollTop
                }, the._animateOptions);
            }

            the.emit('changex', the._scrollLeft);

            return the;
        },


        /**
         * 滚动左边缘
         * @returns {Scrollbar}
         */
        scrollLeft: function () {
            return this.scrollX(0);
        },


        /**
         * 滚动到右边缘
         * @returns {Scrollbar}
         */
        scrollRight: function () {
            return this.scrollX(-1);
        },


        /**
         * y 轴滚动
         * @param {Number} [y] 滚动的位置，相对于框架，默认为当前值，常用来重新定位当前滚动条
         * @returns {Scrollbar}
         */
        scrollY: function (y) {
            var the = this;
            var options = the._options;
            var maxScrollHeight = the._scrollHeight - options.height;
            var track = options.height - the._yHeight - the._yOffset;

            if (arguments.length) {
                y = data.parseFloat(y, 0);

                if (y < 0 || y > maxScrollHeight) {
                    y = maxScrollHeight;
                }

                the._scrollTop = y;
            }

            if (the._scrollTop > maxScrollHeight) {
                the._scrollTop = maxScrollHeight;
            } else if (the._scrollTop < 0) {
                the._scrollTop = 0;
            }

            if (isPlaceholderScroll) {
                if (the._isWheel) {
                    attribute.css(the._body, {
                        top: -the._scrollTop
                    });
                    attribute.css(the._thumbY, {
                        top: the._yTop = track * the._scrollTop / maxScrollHeight
                    });
                } else {
                    animation.animate(the._body, {
                        top: -the._scrollTop
                    }, the._animateOptions);
                    animation.animate(the._thumbY, {
                        top: the._yTop = track * the._scrollTop / maxScrollHeight
                    }, the._animateOptions);
                }
            } else {
                animation.scrollTo(the._wrap, {
                    x: the._scrollLeft,
                    y: the._scrollTop
                }, the._animateOptions);
            }

            the.emit('changey', the._scrollTop);

            return the;
        },


        /**
         * 滚动到顶部
         * @returns {Scrollbar}
         */
        scrollTop: function () {
            return this.scrollY(0);
        },


        /**
         * 滚动都底部
         * @returns {Scrollbar}
         */
        scrollBottom: function () {
            return this.scrollY(-1);
        },


        /**
         * 更新当前内容尺寸
         * @param {Object} [size] 包含 width 和 height 的键值对
         * @returns {Scrollbar}
         */
        update: function (size) {
            var the = this;

            size = size || {};
            the._scrollWidth = size.width || attribute.width(the._ele);
            the._scrollHeight = size.height || attribute.height(the._ele);
            the.resize(the._options);

            return the;
        },


        /**
         * 更新当前框架尺寸
         * @param {Object} [size] 包含 width 和 height 的键值对
         * @returns {Scrollbar}
         */
        resize: function (size) {
            var the = this;
            var options = the._options;

            if (data.type(size) !== 'object') {
                return the;
            }

            data.extend(options, {
                width: size.width,
                height: size.height
            });

            animation.animate(the._wrap, {
                width: options.width,
                height: options.height
            }, the._animateOptions);

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
            the._dragX.destroy();
            the._dragY.destroy();

            // 清除监听
            event.un(the._wrap, updateEvent);
            event.un(the._wrap, 'wheelchange');
            event.un(the._wrap, 'wheelend');

            // unwrap
            modification.remove(the._trackX);
            modification.remove(the._trackY);
            modification.unwrap(the._ele, 'div div');
        }
    }, Emitter);
    var duration = 456;
    var style =
        // 包裹
        '.alien-ui-scrollbar{position:relative;overflow:hidden}' +
        '.alien-ui-scrollbar *{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box}' +
        // 内容
        '.alien-ui-scrollbar-body{position:relative;top:0;left:0}' +
        // 滑道
        '.alien-ui-scrollbar-track{position:absolute;bottom:0;right:0;border-width:0;border-style:solid;border-color:rgba(255,255,255,0);background:rgba(255,255,255,0);-webkit-transition-duration:' + duration + 'ms;-moz-transition-duration:' + duration + 'ms;transition-duration:' + duration + 'ms;-webkit-transition-property:background;-moz-transition-property:background;transition-property:background}' +
        '.alien-ui-scrollbar-track-x{left:0;height:13px;border-top-width:1px}' +
        '.alien-ui-scrollbar-track-y{top:0;width:13px;border-left-width:1px}' +
        '.alien-ui-scrollbar-track:hover{border-color:#ccc;background:#f5f5f5}' +
        '.alien-ui-scrollbar-track-x:hover{box-shadow:inset 0 1px 5px #C2BDBD}' +
        '.alien-ui-scrollbar-track-y:hover{box-shadow:inset 1px 0 5px #C2BDBD}' +
        // 滑块
        '.alien-ui-scrollbar-thumb{position:absolute;background:rgba(0,0,0,.2);border-radius:10px;margin-top:3px;margin-left:3px;-webkit-transition-duration:' + duration + 'ms;-moz-transition-duration:' + duration + 'ms;transition-duration:' + duration + 'ms;-webkit-transition-property:background;-moz-transition-property:background;transition-property:background}' +
        '.alien-ui-scrollbar-thumb-x{width:100%;height:8px;left:0}' +
        '.alien-ui-scrollbar-thumb-y{width:8px;height:100%;top:0}' +
        '.alien-ui-scrollbar-thumb:hover,.alien-ui-scrollbar-thumb-active{background:rgba(0,0,0,.6)}';

    modification.importStyle(style);

    /**
     * 实例化一个自定义滚动条
     * @param {Object} [optoions] 配置
     * @param {Number} [optoions.width=700] 宽度
     * @param {Number} [optoions.height=300] 宽度
     * @param {Number} [optoions.minX=30] 横向滚动条最小宽度
     * @param {Number} [optoions.minY=30] 纵向滚动条最小宽度
     * @param {String} [optoions.axis="y"] 滚轮滚动绑定滚动条方向
     * @param {Number} [optoions.speed=100] 滚轮滚动速度，单位 px
     * @param {Number} [optoions.duration=456] 动画时间，单位 ms
     * @param {String} [optoions.cssEasing="in-out"] CSS 动画缓冲类型
     * @param {String} [optoions.jsEasing="iswing"] JS 动画缓冲类型
     * @constructor
     */
    module.exports = Scrollbar;


    /**
     * 判断是否为占位（占用内容区域）的滚动条
     * 这通常是非手机浏览器
     * @return {Boolean}
     */
    function _isPlaceholderScroll() {
        // 在 iframe 里操作的原因是，滚动条可以被样式修改，防止样式修改导致滚动条判断不正确
        var iframe = modification.create('iframe');
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