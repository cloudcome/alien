/*!
 * Fullpage
 * @author ydr.me
 * @create 2015-05-22 14:56
 */


define(function (require, exports, module) {
    /**
     * @module ui/fullpage/
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/animation
     * @requires core/event/touch
     * @requires core/event/wheel
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/controller
     */

    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/touch.js');
    require('../../core/event/wheel.js');
    var Touch = require('../../libs/touch.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var controller = require('../../utils/controller.js');
    var win = window;
    var doc = win.document;
    var html = doc.documentElement;
    var body = doc.body;
    var defaults = {
        // 动画时间
        duration: 345,
        // 两次事件触发等待间隔
        wait: 123,
        // 动画缓冲
        easing: 'in-out',
        // 滚动方向
        axis: 'y',
        // 项目选择器
        itemSelector: '.fullpage-item',
        // 导航选择器
        navSelector: '.fullpage-nav',
        // 导航生成器
        navGenerator: function (index, length) {
            return '<li data-index="' + index + '"></li>';
        },
        navActiveClass: 'active'
    };
    var Fullpage = ui.create({
        constructor: function ($container, options) {
            var the = this;

            the._$container = selector.query($container)[0];
            the._options = dato.extend({}, defaults, options);
            the._$nav = selector.query(the._options.navSelector)[0];
            the.destroyed = false;
            the._init();
        },

        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._lastIndex = the.index = 0;
            the._animating = false;
            the._initNode();
            the.update();
            the._initEvent();
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;

            var $items = selector.query(options.itemSelector, the._$container);

            the.length = $items.length;
        },


        /**
         * 更新尺寸、内容等信息
         * @returns {Fullpage}
         */
        update: function () {
            var the = this;
            var options = the._options;

            the._axis = [];
            the._pos = [{
                x: 0,
                y: 0
            }];

            if (typeis.string(options.axis)) {
                dato.repeat(the.length, function () {
                    the._axis.push(options.axis);
                });
            } else {
                var axisLength = options.axis.length;

                dato.repeat(the.length - 1, function (index) {
                    the._axis.push(options.axis[index % axisLength]);
                });
            }

            if (typeis.function(options.navGenerator) && the._$nav && !the._hasInit) {
                var navHtml = '';

                the._hasInit = true;
                dato.repeat(the.length, function (index) {
                    navHtml += options.navGenerator.call(the, index, the.length);
                });
                the._$nav.innerHTML = navHtml;
                the._$navItems = selector.children(the._$nav);
                attribute.addClass(the._$navItems[0], options.navActiveClass);
            }

            var winWidth = the._winWidth = attribute.width(win);
            var winHeight = the._winHeight = attribute.height(win);
            var $items = selector.query(options.itemSelector, the._$container);
            var overStyle = {
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            };
            var containerStyle = {};
            var xLength = 0;
            var yLength = 0;
            var lastPos = {
                top: 0,
                left: 0
            };

            dato.each(the._axis, function (index, axis) {
                if (axis === 'x') {
                    xLength++;
                } else {
                    yLength++;
                }
            });

            containerStyle.width = winWidth * xLength;
            containerStyle.height = winHeight * yLength;
            attribute.css(html, overStyle);
            attribute.css(body, overStyle);
            attribute.css(the._$container, containerStyle);
            dato.each($items, function (index, $item) {
                var style = {
                    position: 'absolute',
                    width: winWidth,
                    height: winHeight
                };

                if (index) {
                    var axis = the._axis[index - 1];

                    if (axis === 'x') {
                        lastPos.left += winWidth;
                    } else {
                        lastPos.top += winHeight;
                    }

                    the._pos.push({
                        x: lastPos.left,
                        y: lastPos.top
                    });
                }

                dato.extend(style, lastPos);
                attribute.css($item, style);
            });

            attribute.css(the._$container, {
                translateX: -the._pos[the.index].x,
                translateY: -the._pos[the.index].y
            });

            return the;
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var onup = function () {
                if (the._animating || !the.index) {
                    return;
                }

                the.index--;
                the._translate();
            };
            var ondown = function () {
                if (the._animating || the.index === the.length - 1) {
                    return;
                }

                the.index++;
                the._translate();
            };
            var wheelState = 1;
            the._touch = new Touch(doc);

            the._touch.on('touch1start', the._ontouch1start = function () {
                return false;
            });

            the._touch.on('swipe', the._onswipe = function (eve) {
                switch (eve.alienDetail.changedDirection) {
                    case 'up':
                        return ondown();

                    case 'down':
                        return onup();
                }
            });

            event.on(doc, 'wheelstart', function () {
                wheelState = 2;
            });

            event.on(doc, 'wheelchange', function (eve) {
                if (wheelState !== 2) {
                    return;
                }

                wheelState = 3;

                if (eve.alienDetail.deltaY < 0) {
                    ondown();
                } else {
                    onup();
                }
            });

            event.on(doc, 'wheelend', function () {
                wheelState = 1;
            });

            event.on(win, 'resize', the._onresize = controller.debounce(the.update.bind(the)));
        },


        /**
         * 动画变换
         * @private
         */
        _translate: function () {
            var the = this;

            if (the._lastIndex === the.index) {
                return;
            }

            var options = the._options;

            if (the._animating) {
                return;
            }

            /**
             * 待离开 page
             * @event beforeleave
             * @params index {Number} 待离开的索引值
             * @params length {Number} page 总长度
             */
            the.emit('beforeleave', the._lastIndex, the.length);

            /**
             * 待进入 page
             * @event beforeenter
             * @params index {Number} 待进入的索引值
             * @params length {Number} page 总长度
             */
            the.emit('beforeenter', the.index, the.length);

            the._animating = true;
            animation.transition(the._$container, {
                translateX: -the._pos[the.index].x,
                translateY: -the._pos[the.index].y
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                attribute.removeClass(the._$navItems, options.navActiveClass);
                attribute.addClass(the._$navItems[the.index], options.navActiveClass);
                the._animating = false;
                /**
                 * 已离开 page
                 * @event beforeleave
                 * @params index {Number} 已离开的索引值
                 * @params length {Number} page 总长度
                 */
                the.emit('afterleave', the._lastIndex, the.length);

                /**
                 * 已进入 page
                 * @event afterenter
                 * @params index {Number} 已进入的索引值
                 * @params length {Number} page 总长度
                 */
                the.emit('afterenter', the._lastIndex = the.index, the.length);
            });
        },

        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            event.un(win, 'resize');
            event.un(doc, 'touch1start swipe wheelstart wheelchange wheelend');
        }
    });

    Fullpage.defaults = defaults;
    module.exports = Fullpage;
});