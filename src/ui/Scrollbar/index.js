/*!
 * Scrollbar.js
 * @author ydr.me
 * @create 2014-10-10 22:37
 */


define(function (require, exports, module) {
    /**
     * @module ui/Scrollbar/index
     * @requires ui/generator
     * @requires util/dato
     * @requires libs/Template
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/dom/animation
     * @requires core/event/wheel
     * @requires core/event/drag
     */
    'use strict';

    var generator = require('../generator.js');
    var style = require('css!./style.css');
    var template = require('html!./template.html');
    var dato = require('../../util/dato.js');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/wheel.js');
    var drag = require('../../core/event/drag.js');
    var bodyClass = 'alien-ui-scrollbar-body';
    //var trackClass = 'alien-ui-scrollbar-track';
    var trackXClass = 'alien-ui-scrollbar-track-x';
    var trackYClass = 'alien-ui-scrollbar-track-y';
    //var thumbClass = 'alien-ui-scrollbar-thumb';
    var thumbXClass = 'alien-ui-scrollbar-thumb-x';
    var thumbYClass = 'alien-ui-scrollbar-thumb-y';
    var alienClass = 'alien-ui-scrollbar';
    var alienIndex = 0;
    // var trackActiveClass = 'alien-ui-scrollbar-track-active';
    var thumbActiveClass = 'alien-ui-scrollbar-thumb-active';
    // @link http://en.wikipedia.org/wiki/DOM_binds#Common.2FW3C_binds
    // var updateEvent = 'DOMSubtreeModified DOMNodeInserted DOMNodeRemoved DOMNodeRemovedFromDocument DOMNodeInsertedIntoDocument DOMAttrModified DOMCharacterDataModified';
    // 这里不能用 DOMSubtreeModified，会导致IE卡死
    var updateEvent = ' DOMNodeInserted DOMNodeRemoved DOMNodeRemovedFromDocument DOMNodeInsertedIntoDocument DOMAttrModified DOMCharacterDataModified';
    var isPlaceholderScroll = _isPlaceholderScroll();
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
    var Scrollbar = generator({
        STATIC: {
            defaults: defaults
        },

        constructor: function (ele, options) {
            var the = this;

            the._$ele = selector.query(ele);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = the._$ele[0];
            the._options = dato.extend(!0, {}, defaults, options);
            the._id = alienIndex++;
            the._init();
        },

        /**
         * 初始化
         * @returns {Scrollbar}
         */
        _init: function () {
            var the = this;
            var options = the._options;
            var scrollbarData = {
                id: the._id,
                isPlaceholderScroll: isPlaceholderScroll
            };
            var wrapText = tpl.render(scrollbarData);
            var $wrap;
            var $body;

            the._isTextarea = the._$ele.tagName === 'TEXTAREA';

            if (!the._isTextarea) {
                the._sizeWidth = attribute.width(the._$ele.parentNode);
                the._sizeHeight = attribute.height(the._$ele.parentNode);
            }

            $wrap = modification.parse(wrapText)[0];
            modification.insert($wrap, the._$ele, 'afterend');
            $body = selector.query('.' + alienClass + '-body', $wrap)[0];
            modification.insert(the._$ele, $body, 'afterbegin');

            if (isPlaceholderScroll) {
                the._jsAnimateOptions = {
                    duration: options.duration,
                    easing: options.jsEasing
                };

                the._cssAnimateOptions = {
                    duration: options.duration,
                    easing: options.cssEasing
                };

                the._$body = selector.query('.' + bodyClass, $wrap)[0];
                the._$trackX = selector.query('.' + trackXClass, $wrap)[0];
                the._$trackY = selector.query('.' + trackYClass, $wrap)[0];
                the._$thumbX = selector.query('.' + thumbXClass, $wrap)[0];
                the._$thumbY = selector.query('.' + thumbYClass, $wrap)[0];
                the._xOffset = the._$thumbX.offsetLeft * 2;
                the._yOffset = the._$thumbY.offsetTop * 2;
            } else {
                the._xOffset = 0;
                the._yOffset = 0;

                attribute.css($wrap, {
                    'overflow-scrolling': 'touch',
                    overflow: 'auto'
                });
            }

            if (the._isTextarea) {
                the._sizeWidth = attribute.innerWidth(the._$ele);
                the._sizeHeight = attribute.innerHeight(the._$ele);
            }

            the._$wrap = $wrap;
            // 框架尺寸元素
            the._$size = the._isTextarea ? the._$ele : the._$body;
            // 内容区域的尺寸
            the._scrollLeft = the._$ele.scrollLeft;
            the._scrollTop = the._$ele.scrollTop;
            the._calContentSize('xy');
            //// 滚动区域最大值
            the._scrollLeftMax = the._contentWidth - the._sizeWidth;
            the._scrollTopMax = the._contentHeight - the._sizeHeight;
            // 水平滚动条的左位移
            the._xLeft = 0;
            // 水平滚动条的最大距离
            the._xLeftMax = 0;
            // 水平滚动条的宽度
            the._xWidth = 0;
            the._yTop = 0;
            the._yTopMax = 0;
            the._yHeight = 0;
            // 私有、公有触发
            the._isPrivateTrigger = false;
            the._isPublicTrigger = false;
            the.update();
            the._initEvent();

            return the;
        },


        /**
         * 计算内容尺寸
         * @param axis 方向
         * @private
         */
        _calContentSize: function (axis) {
            var the = this;

            if (axis.indexOf('x') > -1) {
                the._contentWidth = the._$ele[(the._isTextarea ? 'scroll' : 'offset') + 'Width'];
            }

            if (axis.indexOf('y') > -1) {
                the._contentHeight = the._$ele[(the._isTextarea ? 'scroll' : 'offset') + 'Height'];
            }

            // 内容区域的尺寸
            the._scrollLeft = the._$ele.scrollLeft;
            the._scrollTop = the._$ele.scrollTop;
            the._scrollLeftMax = the._contentWidth - the._sizeWidth;
            the._scrollTopMax = the._contentHeight - the._sizeHeight;
        },


        /**
         * 更新当前内容尺寸
         * @param {Object} [scrollSize] 包含 width 和 height 的键值对
         * @returns {Scrollbar}
         */
        update: function () {
            var the = this;

            the.resize({
                width: the._sizeWidth,
                height: the._sizeHeight
            });

            return the;
        },


        /**
         * 更新当前框架尺寸
         * @param {Object} [boxSize] 包含 width 和 height 的键值对
         * @returns {Scrollbar}
         */
        resize: function (boxSize) {
            var the = this;

            boxSize = boxSize || {};

            if (boxSize.width && boxSize.width !== the._sizeWidth) {
                the._sizeWidth = boxSize.width;
            }

            if (boxSize.height && boxSize.height !== the._sizeHeight) {
                the._sizeHeight = boxSize.height;
            }


            attribute[(the._isTextarea ? 'innerW' : 'w') + 'idth'](the._$size, the._sizeWidth);
            attribute[(the._isTextarea ? 'innerH' : 'h') + 'eight'](the._$size, the._sizeHeight);
            // 内容尺寸
            the._calContentSize('xy');
            the._resize();
            the._scrollX();
            the._scrollY();

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
            var sizeWidth = the._isTextarea ? attribute.innerWidth(the._$size) : the._sizeWidth;
            var sizeHeight = the._isTextarea ? attribute.innerHeight(the._$size) : the._sizeHeight;

            // 计算滚动条的x轴的宽、y轴的高
            // 6等于滚动条的左边距3 + 右边距3
            the._xWidth = (sizeWidth - the._xOffset) * sizeWidth / the._contentWidth;

            if (the._xWidth < options.minX) {
                the._xWidth = options.minX;
            }

            the._yHeight = (sizeHeight - the._yOffset) * sizeHeight / the._contentHeight;

            if (the._yHeight < options.minY) {
                the._yHeight = options.minY;
            }

            the._xLeftMax = sizeWidth - the._xWidth - the._xOffset;
            the._yTopMax = sizeHeight - the._yHeight - the._yOffset;

            if (the._xLeftMax <= 0) {
                attribute.css(the._$trackX, 'display', 'none');
            } else {
                attribute.css(the._$trackX, 'display', 'block');
            }

            if (the._yTopMax <= 0) {
                attribute.css(the._$trackY, 'display', 'none');
            } else {
                attribute.css(the._$trackY, 'display', 'block');
            }

            animation.stop(the._$thumbX);
            animation.animate(the._$thumbX, {
                width: the._xWidth
            }, the._cssAnimateOptions);

            animation.stop(the._$thumbY);
            animation.animate(the._$thumbY, {
                height: the._yHeight
            }, the._cssAnimateOptions);
        },


        /**
         * 设置滚动距离
         * @param key
         * @private
         */
        _setScroll: function (key) {
            var the = this;
            var isHorizontal = key === 'x';
            var val = isHorizontal ? the._scrollLeft : the._scrollTop;

            if (the._isPrivateTrigger || the._isPublicTrigger) {
                animation.stop(the._$size);
                animation.scrollTo(the._$size, {
                    x: the._scrollLeft,
                    y: the._scrollTop
                }, function () {
                    the._isPrivateTrigger = the._isPublicTrigger = false;
                });
            } else {
                the._$size['scroll' + (isHorizontal ? 'Left' : 'Top')] = val;
            }
        },


        /**
         * 事件监听
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;
            var $thumb = options.axis === 'y' ? the._$thumbY : the._$thumbX;
            var key = options.axis === 'y' ? 'Top' : 'Left';
            var x0;
            var left0;
            var y0;
            var top0;

            if (isPlaceholderScroll) {
                // 更新内容尺寸
                event.on(the._$size, updateEvent, function () {
                    the.update();
                });

                // 自身滚动
                event.on(the._$size, 'scroll', the._onscroll.bind(the));

                if (the._isTextarea) {
                    event.on(the._$size, 'input', the._oninput.bind(the));
                }

                // 鼠标滚动
                event.on(the._$wrap, 'wheelstart', function () {
                    attribute.addClass($thumb, thumbActiveClass);
                });

                event.on(the._$wrap, 'wheelchange', function (eve) {
                    var y = eve.alienDetail.deltaY;
                    var d = -y * options.speed;

                    d = the['_scroll' + key] + d;

                    if (d >= 0 && d <= the['_scroll' + key + 'Max']) {
                        eve.preventDefault();
                    }

                    the['_scroll' + key] = d;
                    the['_scroll' + options.axis.toUpperCase()]();
                });

                event.on(document, 'wheelend', the._onwheelend.bind(the, $thumb));

                // 拖拽支持

                event.on(the._$thumbX, 'dragstart', function (eve) {
                    eve.preventDefault();

                    x0 = eve.pageX;
                    left0 = parseFloat(attribute.css(the._$thumbX, 'left'));
                    attribute.addClass(the._$thumbX, thumbActiveClass);
                });

                event.on(the._$thumbX, 'drag', function (eve) {
                    eve.preventDefault();

                    var left = left0 + eve.pageX - x0;

                    if (left < 0) {
                        left = 0;
                    } else if (left > the._xLeftMax) {
                        left = the._xLeftMax;
                    }

                    the._xLeft = left;
                    the._scrollLeft = the._scrollLeftMax * left / the._xLeftMax;
                    the._setScroll('x');
                    attribute.css(the._$thumbX, 'left', left);
                    the.emit('changex', the._scrollLeft);
                });

                event.on(the._$thumbX, 'dragend', function (eve) {
                    eve.preventDefault();
                    attribute.removeClass(the._$thumbX, thumbActiveClass);
                });

                event.on(the._$thumbY, 'dragstart', function (eve) {
                    eve.preventDefault();

                    y0 = eve.pageY;
                    top0 = parseFloat(attribute.css(the._$thumbY, 'top'));
                    attribute.addClass(the._$thumbY, thumbActiveClass);
                });

                event.on(the._$thumbY, 'drag', function (eve) {
                    eve.preventDefault();

                    var top = top0 + eve.pageY - y0;

                    if (top < 0) {
                        top = 0;
                    } else if (top > the._yTopMax) {
                        top = the._yTopMax;
                    }

                    the._yTop = top;
                    the._scrollTop = the._scrollTopMax * top / the._yTopMax;
                    the._setScroll('y');
                    attribute.css(the._$thumbY, 'top', top);
                    the.emit('changey', the._scrollTop);
                });

                event.on(the._$thumbY, 'dragend', function (eve) {
                    eve.preventDefault();

                    attribute.removeClass(the._$thumbY, thumbActiveClass);
                });
            } else {
                event.on(the._$wrap, 'scroll', function () {
                    if (the._scrollLeft !== the._$wrap.scrollLeft) {
                        the._scrollLeft = the._$wrap.scrollLeft;
                        the.emit('changex', the._scrollLeft);
                    }

                    if (the._scrollTop !== the._$wrap.scrollTop) {
                        the._scrollTop = the._$wrap.scrollTop;
                        the.emit('changey', the._scrollTop);
                    }
                });
            }
        },


        /**
         * 滚动结束
         * @param $thumb
         * @private
         */
        _onwheelend: function ($thumb) {
            attribute.removeClass($thumb, thumbActiveClass);
        },


        /**
         * 滚动时回调
         * @private
         */
        _onscroll: function () {
            var the = this;

            if (the._isPrivateTrigger || the._isPublicTrigger) {
                return;
            }

            if (the._$size.scrollLeft !== the._scrollLeft) {
                the._scrollLeft = the._$size.scrollLeft;
                the._scrollX();
            }

            if (the._$size.scrollTop !== the._scrollTop) {
                the._scrollTop = the._$size.scrollTop;
                the._scrollY();
            }
        },


        /**
         * 输入时回调
         * @private
         */
        _oninput: function () {
            var the = this;

            if (the._isPrivateTrigger) {
                the._isPrivateTrigger = false;
                return;
            }

            the._calContentSize('xy');
            the._scrollLeftMax = the._contentWidth - the._sizeWidth;
            the._scrollTopMax = the._contentHeight - the._sizeHeight;
            the.update();
        },


        /**
         * x 轴滚动
         * @param {Number} [x] 滚动的位置，相对于框架，默认为当前值，常用来重新定位当前滚动条
         * @returns {Scrollbar}
         */
        _scrollX: function (x) {
            var the = this;

            if (the._scrollLeftMax <= 0) {
                return the;
            }

            if (arguments.length) {
                if (!the._isPublicTrigger) {
                    the._isPrivateTrigger = true;
                }

                x = dato.parseFloat(x, 0);

                if (x < 0 || x > the._contentWidth) {
                    x = the._contentWidth;
                }

                the._scrollLeft = x;
            }

            if (the._scrollLeft > the._scrollLeftMax) {
                the._scrollLeft = the._scrollLeftMax;
            } else if (the._scrollLeft < 0) {
                the._scrollLeft = 0;
            }

            the._xLeft = the._xLeftMax * the._scrollLeft / the._scrollLeftMax;

            if (the._isPublicTrigger) {
                attribute.addClass(the._$thumbX, thumbActiveClass);
            }

            if (isPlaceholderScroll) {
                if (the._isPrivateTrigger || the._isPublicTrigger) {
                    animation.stop(the._$thumbX);
                    animation.animate(the._$thumbX, {
                        left: the._xLeft
                    }, the._cssAnimateOptions, function () {
                        attribute.removeClass(the._$thumbX, thumbActiveClass);
                    });
                } else {
                    attribute.css(the._$thumbX, {
                        left: the._xLeft
                    });
                }

                the._setScroll('x');
            } else {
                animation.scrollTo(the._$wrap, {
                    x: the._scrollLeft,
                    y: the._scrollTop
                }, the._jsAnimateOptions, function () {
                    attribute.removeClass(the._$thumbX, thumbActiveClass);
                });
            }

            the.emit('changex', the._scrollLeft);


            return the;
        },


        /**
         * 滚动左边缘
         * @returns {Scrollbar}
         */
        scrollLeft: function () {
            var the = this;

            the._isPublicTrigger = true;
            return the._scrollX(0);
        },


        /**
         * 滚动到右边缘
         * @returns {Scrollbar}
         */
        scrollRight: function () {
            var the = this;

            the._isPublicTrigger = true;
            return the._scrollX(the._scrollLeftMax);
        },


        /**
         * y 轴滚动
         * @param {Number} [y] 滚动的位置，相对于框架，默认为当前值，常用来重新定位当前滚动条
         * @returns {Scrollbar}
         */
        _scrollY: function (y) {
            var the = this;

            if (the._scrollTopMax <= 0) {
                return the;
            }

            if (arguments.length) {
                if (!the._isPublicTrigger) {
                    the._isPrivateTrigger = true;
                }

                y = dato.parseFloat(y, 0);

                if (y < 0 || y > the._contentHeight) {
                    y = the._contentHeight;
                }

                the._scrollTop = y;
            }

            if (the._scrollTop > the._scrollTopMax) {
                the._scrollTop = the._scrollTopMax;
            } else if (the._scrollTop < 0) {
                the._scrollTop = 0;
            }

            the._yTop = the._yTopMax * the._scrollTop / the._scrollTopMax;

            if (the._isPublicTrigger) {
                attribute.addClass(the._$thumbY, thumbActiveClass);
            }

            if (isPlaceholderScroll) {
                if (the._isPrivateTrigger || the._isPublicTrigger) {
                    animation.stop(the._$thumbY);
                    animation.animate(the._$thumbY, {
                        top: the._yTop
                    }, the._cssAnimateOptions, function () {
                        attribute.removeClass(the._$thumbY, thumbActiveClass);
                    });
                } else {
                    attribute.css(the._$thumbY, {
                        top: the._yTop
                    });
                }

                the._setScroll('y');
            } else {
                animation.scrollTo(the._$wrap, {
                    x: the._scrollLeft,
                    y: the._scrollTop
                }, the._jsAnimateOptions, function () {
                    attribute.removeClass(the._$thumbY, thumbActiveClass);
                });
            }

            the.emit('changey', the._scrollTop);


            return the;
        },


        /**
         * 滚动到顶部
         * @returns {Scrollbar}
         */
        scrollTop: function () {
            var the = this;

            the._isPublicTrigger = true;
            return the._scrollY(0);
        },


        /**
         * 滚动都底部
         * @returns {Scrollbar}
         */
        scrollBottom: function () {
            var the = this;

            the._isPublicTrigger = true;
            return the._scrollY(the._scrollTopMax);
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            // 清除拖拽
            event.un(the._$thumbX, 'dragsatrt drag dragend');
            event.un(the._$thumbY, 'dragsatrt drag dragend');

            // 清除监听
            event.un(the._$size, updateEvent);
            event.un(the._$wrap, 'wheelstart');
            event.un(the._$wrap, 'wheelchange');
            event.un(document, 'wheelend', the._onwheelend);
            event.un(the._$size, 'scroll', the._onscroll);
            event.un(the._$size, 'input', the._oninput);

            // unwrap
            modification.remove(the._$trackX);
            modification.remove(the._$trackY);
            modification.unwrap(the._$ele, 'div div');
        }
    });

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

        modification.remove(iframe);
        return clientWidth < 100;
    }
});