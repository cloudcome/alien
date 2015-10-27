/*!
 * 自定义滚动条
 * @author ydr.me
 * @create 2014-10-10 22:37
 */


define(function (require, exports, module) {
    /**
     * @module ui/scrollbar/
     * @requires ui/
     * @requires utils/dato
     * @requires utils/controller
     * @requires libs/template
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/dom/animation
     * @requires core/event/wheel
     * @requires core/event/drag
     * @requires core/event/touch
     */
    'use strict';

    var ui = require('../');
    var style = require('./style.css', 'css');
    var template = require('./template.html', 'html');
    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');
    var Template = require('../../libs/template.js');
    var tpl = new Template(template);
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/wheel.js');
    var bodyClass = 'alien-ui-scrollbar-body';
    //var trackClass = 'alien-ui-scrollbar-track';
    var trackXClass = 'alien-ui-scrollbar-track-x';
    var trackYClass = 'alien-ui-scrollbar-track-y';
    //var thumbClass = 'alien-ui-scrollbar-thumb';
    var thumbXClass = 'alien-ui-scrollbar-thumb-x';
    var thumbYClass = 'alien-ui-scrollbar-thumb-y';
    //var alienClass = 'alien-ui-scrollbar';
    var alienIndex = 0;
    // var trackActiveClass = 'alien-ui-scrollbar-track-active';
    var thumbActiveClass = 'alien-ui-scrollbar-thumb-active';
    // @link http://en.wikipedia.org/wiki/DOM_binds#Common.2FW3C_binds
    // var updateEvent = 'DOMSubtreeModified DOMNodeInserted DOMNodeRemoved DOMNodeRemovedFromDocument DOMNodeInsertedIntoDocument DOMAttrModified DOMCharacterDataModified';
    // 这里不能用 DOMSubtreeModified，会导致IE卡死
    var updateEvent = ' DOMNodeInserted DOMNodeRemoved DOMNodeRemovedFromDocument DOMNodeInsertedIntoDocument DOMAttrModified DOMCharacterDataModified';
    var isPlaceholderScroll = _isPlaceholderScroll();
    var maxNumber = Math.pow(2, 53);
    var defaults = {
        width: 700,
        height: 300,
        minX: 30,
        minY: 30,
        axis: 'y',
        speed: 100,
        duration: 456,
        cssEasing: 'in-out',
        jsEasing: 'swing',
        addClass: '',
        isStandAlone: false
    };
    var Scrollbar = ui.create({
        constructor: function (ele, options) {
            var the = this;

            the._$ele = selector.query(ele);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = the._$ele[0];
            options = the._options = dato.extend(!0, {}, defaults, options);
            the._id = alienIndex++;
            the.className = 'scrollbar';
            var scrollbarData = {
                id: the._id,
                isPlaceholderScroll: isPlaceholderScroll
            };
            var wrapHTML = tpl.render(scrollbarData);
            var $temp = modification.parse(wrapHTML)[0];
            var $body = selector.query('.' + bodyClass, $temp)[0];
            var $trackX = selector.query('.' + trackXClass, $temp)[0];
            var $trackY = selector.query('.' + trackYClass, $temp)[0];
            var $thumbX = selector.query('.' + thumbXClass, $temp)[0];
            var $thumbY = selector.query('.' + thumbYClass, $temp)[0];
            var $ele = the._$ele;
            var $parent = $ele.parentNode;
            var isTextarea = $ele.tagName === 'TEXTAREA';

            the._jsAnimateOptions = {
                duration: options.duration,
                easing: options.jsEasing
            };

            the._cssAnimateOptions = {
                duration: options.duration,
                easing: options.cssEasing
            };

            attribute.addClass($temp, options.addClass);
            attribute.addClass($parent, the._className = $temp.className);

            if (isPlaceholderScroll) {
                modification.insert($trackY, $ele, 'afterend');
                modification.insert($trackX, $ele, 'afterend');
                modification.insert($body, $ele, 'afterend');
                modification.insert($ele, $body, 'beforeend');
                the._$trackX = $trackX;
                the._$trackY = $trackY;
                the._$thumbX = $thumbX;
                the._$thumbY = $thumbY;
                the._$parent = $parent;
                the._$body = $body;
                the._$scroll = isTextarea ? $ele : $body;
                the._isTextarea = isTextarea;
                the._thumbXOffset = 3;
                the._thumbYOffset = 3;
                the._initEvent();
            } else {
                attribute.css($parent, {
                    overflow: 'auto !important',
                    overflowScrolling: 'touch'
                });
                the._$scroll = isTextarea ? $ele : $parent;

                if (isTextarea) {
                    attribute.css($ele, {
                        overflow: 'auto !important',
                        overflowScrolling: 'touch'
                    });
                }
            }

            the.resize();
            return the;
        },


        /**
         * 更新当前框架尺寸
         */
        resize: function () {
            var the = this;

            the._trigger = true;
            the._calScrollSize();

            if (isPlaceholderScroll) {
                the._calTrackSize();
                the._scrollX();
                the._scrollY();
            }

            return the;
        },


        /**
         * 计算滚动条尺寸
         * @private
         */
        _calScrollSize: function () {
            var the = this;
            var $scroll = the._$scroll;
            var $parent = the._$parent;

            // 当前滚动条值
            the._scrollLeft = $scroll.scrollLeft;
            the._scrollTop = $scroll.scrollTop;

            // 当前容器尺寸
            the._containerWidth = attribute.innerWidth($parent);
            the._containerHeight = attribute.innerHeight($parent);
            the._scrollWidth = $scroll.scrollWidth;
            the._scrollHeight = $scroll.scrollHeight;

            // 纵向滚动条最大值
            $scroll.scrollTop = maxNumber;
            the._scrollTopMax = $scroll.scrollTop;
            $scroll.scrollTop = the._scrollTop;

            // 横向滚动条最大值
            $scroll.scrollLeft = maxNumber;
            the._scrollLeftMax = $scroll.scrollLeft;
            $scroll.scrollLeft = the._scrollLeft;
        },


        /**
         * 计算滚动轨道尺寸
         * @private
         */
        _calTrackSize: function () {
            var the = this;

            if (!isPlaceholderScroll) {
                return the;
            }

            var $trackX = the._$trackX;
            var $thumbX = the._$thumbX;
            var $trackY = the._$trackY;
            var $thumbY = the._$thumbY;
            // 尺寸比例
            var thumbWidthRatio = the._scrollWidth === 0 ? 0 : the._containerWidth / the._scrollWidth;
            var thumbHeightRatio = the._scrollHeight === 0 ? 0 : the._containerHeight / the._scrollHeight;
            // 距离比例
            var thumbLeftRatio = the._scrollLeftMax === 0 ? 0 : the._scrollLeft / the._scrollLeftMax;
            var thumbTopRatio = the._scrollTopMax === 0 ? 0 : the._scrollTop / the._scrollTopMax;
            var options = the._options;

            the._trackWidth = attribute.width($trackX) - the._thumbXOffset;
            the._trackHeight = attribute.height($trackY) - the._thumbYOffset;
            the._thumbWidth = the._trackWidth * thumbWidthRatio;
            the._thumbHeight = the._trackHeight * thumbHeightRatio;

            if (the._thumbWidth < options.minX) {
                the._thumbWidth = options.minX;
            }

            if (the._thumbHeight < options.minY) {
                the._thumbHeight = options.minY;
            }

            the._thumbLeftMax = the._trackWidth - the._thumbWidth - the._thumbXOffset;
            the._thumbTopMax = the._trackHeight - the._thumbHeight - the._thumbYOffset;
            the._thumbLeft = the._thumbLeftMax * thumbLeftRatio;
            the._thumbTop = the._thumbTopMax * thumbTopRatio;

            var thumbXSize = {
                left: the._thumbLeft,
                width: the._thumbWidth
            };

            if (the._thumbLeftMax <= 0) {
                attribute.css($trackX, 'display', 'none');
            } else {
                attribute.css($trackX, 'display', 'block');

                if (the._trigger) {
                    animation.transition($thumbX, thumbXSize, the._cssAnimateOptions);
                } else {
                    attribute.css($thumbX, thumbXSize);
                }
            }

            var thumbYSize = {
                top: the._thumbTop,
                height: the._thumbHeight
            };
            if (the._thumbTopMax <= 0) {
                attribute.css($trackY, 'display', 'none');
            } else {
                attribute.css($trackY, 'display', 'block');

                if (the._trigger) {
                    animation.transition($thumbY, thumbYSize, the._cssAnimateOptions);
                } else {
                    attribute.css($thumbY, thumbYSize);
                }
            }
        },


        /**
         * 设置滚动距离
         * @private
         */
        _setScroll: function () {
            var the = this;
            var $scroll = the._$scroll;

            if (the._trigger) {
                animation.scrollTo($scroll, {
                    x: the._scrollLeft,
                    y: the._scrollTop
                }, function () {
                    if (the._scrollTimer) {
                        clearTimeout(the._scrollTimer);
                    }

                    the._scrollTimer = setTimeout(function () {
                        the._trigger = false;
                        the._scrollTimer = 0;
                    }, 100);
                });
            } else {
                $scroll.scrollLeft = the._scrollLeft;
                $scroll.scrollTop = the._scrollTop;
            }
        },


        /**
         * 事件监听
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;
            var $scroll = the._$scroll;
            var $thumb = options.axis === 'y' ? the._$thumbY : the._$thumbX;
            var $parent = the._$parent;
            var key = options.axis === 'y' ? 'Top' : 'Left';
            var x0;
            var left0;
            var y0;
            var top0;

            if (isPlaceholderScroll) {
                // 更新内容尺寸
                event.on(the._$ele, updateEvent, controller.debounce(the.resize.bind(the)));

                // 自身滚动
                event.on($scroll, 'scroll', the._onscroll.bind(the));

                if (the._isTextarea) {
                    event.on($scroll, 'input', the._oninput.bind(the));
                }

                // 鼠标滚动
                event.on($parent, 'wheelstart', function () {
                    the._isWeel = true;
                    attribute.addClass($thumb, thumbActiveClass);
                });

                event.on($parent, 'wheelchange', function (eve) {
                    var y = eve.alienDetail.deltaY;
                    var d = -y * options.speed;

                    the['_scroll' + key] += d;

                    if (options.isStandAlone ||
                        !options.isStandAlone &&
                        the['_scroll' + key] >= 0 &&
                        the['_scroll' + key] <= the['_scroll' + key + 'Max']
                    ) {
                        eve.preventDefault();
                    }

                    the['_scroll' + options.axis.toUpperCase()]();
                    the._calTrackSize();
                });

                event.on(document, 'wheelend', the._onwheelend.bind(the, $thumb));
                event.on(the._$trackX, 'click', function () {
                    return false;
                });
                event.on(the._$trackY, 'click', function () {
                    return false;
                });

                // 拖拽支持
                event.on(the._$thumbX, 'dragstart', function (eve) {
                    the._isDrag = true;
                    x0 = eve.pageX;
                    left0 = parseFloat(attribute.css(the._$thumbX, 'left'));
                    attribute.addClass(the._$thumbX, thumbActiveClass);

                    return false;
                });

                event.on(the._$thumbX, 'drag', function (eve) {
                    var left = left0 + eve.pageX - x0;

                    if (left < 0) {
                        left = 0;
                    } else if (left > the._thumbLeftMax) {
                        left = the._thumbLeftMax;
                    }

                    attribute.css(the._$thumbX, 'left', left);
                    the._scrollLeft = the._scrollLeftMax * left / the._thumbLeftMax;
                    the._scrollX();

                    return false;
                });

                event.on(the._$thumbX, 'dragend', function (eve) {
                    the._isDrag = false;
                    attribute.removeClass(the._$thumbX, thumbActiveClass);

                    return false;
                });

                event.on(the._$thumbY, 'dragstart', function (eve) {
                    eve.preventDefault();
                    the._isDrag = true;
                    y0 = eve.pageY;
                    top0 = parseFloat(attribute.css(the._$thumbY, 'top'));
                    attribute.addClass(the._$thumbY, thumbActiveClass);
                });

                event.on(the._$thumbY, 'drag', function (eve) {
                    var top = top0 + eve.pageY - y0;

                    if (top < 0) {
                        top = 0;
                    } else if (top > the._thumbTopMax) {
                        top = the._thumbTopMax;
                    }

                    attribute.css(the._$thumbY, 'top', top);
                    the._scrollTop = the._scrollTopMax * top / the._thumbTopMax;
                    the._scrollY();

                    return false;
                });

                event.on(the._$thumbY, 'dragend', function (eve) {
                    the._isDrag = false;
                    attribute.removeClass(the._$thumbY, thumbActiveClass);

                    return false;
                });

                event.on(window, 'resize', the._onresize = controller.debounce(the.resize.bind(the)));
            } else {
                event.on($scroll, 'scroll', function () {
                    if (the._scrollLeft !== $scroll.scrollLeft) {
                        the._scrollLeft = $scroll.scrollLeft;

                        /**
                         * X 轴方向滚动
                         * @event scrollx
                         * @param scrollLeft {Number} 滚动条左边位移
                         */
                        the.emit('scrollx', the._scrollLeft);
                    }

                    if (the._scrollTop !== $scroll.scrollTop) {
                        the._scrollTop = $scroll.scrollTop;

                        /**
                         * Y 轴方向滚动
                         * @event scrolly
                         * @param scrollTop {Number} 滚动条顶部位移
                         */
                        the.emit('scrolly', the._scrollTop);
                    }
                });
            }
        },


        /**
         * 输入回调
         * @private
         */
        _oninput: function () {
            var the = this;

            the._isInput = true;

            if (the._inputTimer) {
                clearTimeout(the._inputTimer);
            }

            the._inputTimer = setTimeout(function () {
                the._isInput = false;
                the._inputTimer = 0;
                the._trigger = true;
                the._calScrollSize();
                the._calTrackSize();
            }, 20);
        },


        /**
         * 滚动结束
         * @param $thumb
         * @private
         */
        _onwheelend: function ($thumb) {
            this._isWeel = false;
            attribute.removeClass($thumb, thumbActiveClass);
        },


        /**
         * 滚动时回调
         * @private
         */
        _onscroll: function () {
            var the = this;
            var $scroll = the._$scroll;

            if (!(the._isWeel || the._isDrag || the._isInput || the._trigger)) {
                the._scrollLeft = $scroll.scrollLeft;
                the._scrollTop = $scroll.scrollTop;
                the._calTrackSize();
            }
        },


        /**
         * x 轴滚动
         */
        _scrollX: function () {
            var the = this;

            if (the._scrollLeftMax <= 0) {
                return the;
            }

            if (the._scrollLeft > the._scrollLeftMax) {
                the._scrollLeft = the._scrollLeftMax;
            } else if (the._scrollLeft < 0) {
                the._scrollLeft = 0;
            }

            the._thumbLeft = the._thumbLeftMax * the._scrollLeft / the._scrollLeftMax;
            the._setScroll();

            /**
             * X 轴方向滚动
             * @event scrollx
             * @param scrollLeft {Number} 滚动条左边位移
             */
            the.emit('scrollx', the._scrollLeft);
        },


        /**
         * 滚动左边缘
         */
        scrollLeft: function () {
            var the = this;

            the._trigger = true;
            the._scrollLeft = 0;
            the._scrollX();
            the._calTrackSize();

            return the;
        },


        /**
         * 滚动到右边缘
         */
        scrollRight: function () {
            var the = this;

            the._trigger = true;
            the._scrollLeft = the._scrollLeftMax;
            the._scrollX();
            the._calTrackSize();

            return the;
        },


        /**
         * y 轴滚动
         */
        _scrollY: function () {
            var the = this;

            if (the._scrollTopMax <= 0) {
                return the;
            }

            if (the._scrollTop > the._scrollTopMax) {
                the._scrollTop = the._scrollTopMax;
            } else if (the._scrollTop < 0) {
                the._scrollTop = 0;
            }

            the._thumbTop = the._thumbTopMax * the._scrollTop / the._scrollTopMax;
            the._setScroll();

            /**
             * Y 轴方向滚动
             * @event scrolly
             * @param scrollTop {Number} 滚动条顶部位移
             */
            the.emit('scrolly', the._scrollTop);
        },


        /**
         * 滚动到顶部
         */
        scrollTop: function () {
            var the = this;

            the._trigger = true;
            the._scrollTop = 0;
            the._scrollY();
            the._calTrackSize();

            return the;
        },


        /**
         * 滚动都底部
         */
        scrollBottom: function () {
            var the = this;

            the._trigger = true;
            the._scrollTop = the._scrollTopMax;
            the._scrollY();
            the._calTrackSize();

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            // 清除拖拽
            var eve1 = 'dragsatrt drag dragend';
            event.un(the._$thumbX, eve1);
            event.un(the._$thumbY, eve1);

            // 清楚单击、tap
            var eve2 = 'click';
            event.un(the._$trackX, eve2);
            event.un(the._$trackY, eve2);

            // 清除监听
            event.un(the._$ele, updateEvent);
            event.un(the._$parent, 'wheelstart');
            event.un(the._$parent, 'wheelchange');
            event.un(document, 'wheelend', the._onwheelend);
            event.un(the._$ele, 'scroll', the._onscroll);
            event.un(the._$ele, 'input', the._oninput);

            // unwrap
            modification.remove(the._$trackX);
            modification.remove(the._$trackY);
            modification.unwrap(the._$ele, 'div');
            attribute.removeClass(the._$ele, the._className);
        }
    });
    Scrollbar.defaults = defaults;
    require('../../core/event/drag.js');
    require('../../core/event/touch.js');
    ui.importStyle(style);

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
     * @param {String} [optoions.addClass=""] 额外添加的 className
     * @param {String} [optoions.isStandAlone=false] 是否为独立区域，独立区域即在滚动超过边际时不会释放对滚轮的阻止
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