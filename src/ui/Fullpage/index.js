/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-22 14:56
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/touch.js');
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
            the._init();
        },

        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the.index = 0;
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

            if (typeis.function(options.navGenerator) && the._$nav) {
                var navHtml = '';

                dato.repeat(the.length, function (index) {
                    navHtml += options.navGenerator.call(the, index, the.length);
                });

                the._$nav.innerHTML = navHtml;
                the._$navItems = selector.children(the._$nav);

                if (!the._hasInit) {
                    the._hasInit = true;
                    attribute.addClass(the._$navItems[0], options.navActiveClass);
                }
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
            var length = the.length;

            if (options.axis === 'x') {
                containerStyle.width = winWidth * length;
                containerStyle.height = winHeight;
            } else {
                containerStyle.width = winWidth;
                containerStyle.height = winHeight * length;
            }

            attribute.css(html, overStyle);
            attribute.css(body, overStyle);
            attribute.css(the._$container, containerStyle);
            dato.each($items, function (index, $item) {
                var style = {
                    position: 'absolute',
                    width: winWidth,
                    height: winHeight
                };

                if (options.axis === 'x') {
                    style.left = index * winWidth;
                    style.top = 0;
                } else {
                    style.top = index * winHeight;
                    style.left = 0;
                }

                attribute.css($item, style);
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

            event.on(doc, 'touch1start', the._ontouch1start = function () {
                return false;
            });

            event.on(doc, 'swipe', the._onswipe = function (eve) {
                switch (eve.alienDetail.changedDirection) {
                    case 'up':
                        return ondown();

                    case 'down':
                        return onup();
                }
            });

            event.on(doc, 'wheelstart', function () {
                wheelState = 2;
                //console.log('wheelstart', wheelState);
            });

            event.on(doc, 'wheelchange', the._onwheel = function (eve) {
                //console.log('wheelchange', wheelState);

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
                //console.log('wheelend', wheelState);
            });

            event.on(win, 'resize', the._onresize = controller.debounce(the.update.bind(the)));
        },


        /**
         * 动画变换
         * @private
         */
        _translate: function () {
            var the = this;
            var options = the._options;
            var to = {};

            to['translate' + (options.axis.toUpperCase())] = -the.index * (options.axis === 'x' ? the._winWidth : the._winHeight);

            if (the._animating) {
                return;
            }

            the._animating = true;
            animation.transition(the._$container, to, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                attribute.removeClass(the._$navItems, options.navActiveClass);
                attribute.addClass(the._$navItems[the.index], options.navActiveClass);
                the._animating = false;
            });
        },

        destroy: function () {
            event.un(win, 'resize');
            event.un(doc, 'touch1start swipe wheelchange');
        }
    });

    require('../../core/event/wheel.js');
    Fullpage.defaults = defaults;
    module.exports = Fullpage;
});