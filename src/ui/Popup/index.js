/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-16 11:36
 */


define(function (require, exports, module) {
    /**
     * @module ui/Popup/
     */

    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var dato = require('../../utils/dato.js');
    var Template = require('../../libs/Template.js');
    var template = require('./template.html', 'html');
    var tpl = new Template(template);
    var style = require('./style.css', 'css');
    var alienClass = 'alien-ui-popup';
    var alienId = 0;
    var win = window;
    var doc = win.document;
    var body = doc.body;
    var defaults = {
        // 箭头位置：auto、top、right、bottom、left、none
        arrow: 'auto',
        // 箭头的大小
        size: 10,
        // 对齐优先级：center、side
        // center:
        //       [=====]
        // [========^========]
        // side:
        // [=====]
        // [==^==============]
        priority: 'center',
        // 弹出层的宽度
        width: 'auto',
        // 弹出层的高度
        height: 'auto',
        duration: 234,
        easing: 'in-out'
    };
    var Popup = ui.create({
        constructor: function ($target, options) {
            var the = this;

            the._$target = selector.query($target)[0];
            the._options = dato.extend({}, defaults, options);

            if (the._options.arrow === 'none') {
                the._options.size = 0;
            }

            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            the._html = tpl.render({
                id: the._id = alienId++
            });
            modification.insert(the._html, body);
            the._$popup = selector.query('#' + alienClass + '-' + the._id)[0];

            var nodes = selector.query('.j-flag', the._$popup);

            the._$arrowTop = nodes[0];
            the._$arrowRight = nodes[1];
            the._$arrowBottom = nodes[2];
            the._$arrowLeft = nodes[3];
            the._$html = nodes[4];
        },


        /**
         * 设置弹出层的内容
         * @param html {String} 内容
         * @returns {Popup}
         */
        setContent: function (html) {
            var the = this;

            the._$html.innerHTML = html;

            return the;
        },


        open: function () {
            var the = this;
            var options = the._options;
            // popup 位置顺序
            var dirList = ['bottom', 'right', 'top', 'left'];
            var arrowList = ['top', 'left', 'bottom', 'right'];
            // 优先级顺序
            var priorityList = options.priority === 'center' ? ['center', 'side'] : ['side'];

            // 1. 计算窗口位置
            the._document = {
                width: attribute.outerWidth(doc),
                height: attribute.outerHeight(doc)
            };

            // 2. 计算目标位置
            the._target = {
                width: attribute.outerWidth(the._$target),
                height: attribute.outerHeight(the._$target),
                left: attribute.left(the._$target),
                top: attribute.top(the._$target)
            };

            // 3. 透明显示 popup，便于计算
            attribute.css(the._$popup, {
                zIndex: ui.getZindex(),
                display: 'block',
                opacity: 0
            });
            the._popup = {
                width: attribute.outerWidth(the._$popup),
                height: attribute.outerHeight(the._$popup),
                left: attribute.left(the._$popup),
                top: attribute.top(the._$popup)
            };

            // 3. 第一优先级的位置，如果全部位置都不符合，则选择第一优先级的位置
            var firstPos = null;
            var findArrow = null;
            var findPos = null;

            dato.each(dirList, function (i, dir) {
                var arrow = arrowList[i];

                dato.each(priorityList, function (j, priority) {
                    var pos = the._cal(dir, priority);

                    if (i === 0 && priority === 'side') {
                        firstPos = pos;
                    }

                    if (the._check(pos)) {
                        findPos = pos;
                        findArrow = arrow;
                        return false;
                    }
                });

                if (findPos) {
                    return false;
                }
            });

            if (!findPos) {
                findPos = firstPos;
                findArrow = arrowList[0];
            }

            // 4. 动画显示
            attribute.css(the._$popup, {
                scale: 0.8,
                top: findPos.top,
                left: findPos.left
            });
            animation.transition(the._$popup, {
                scale: 1,
                opacity: 1
            }, {
                duration: options.duration,
                easing: options.easing
            });
        },


        close: function () {

        },


        /**
         * 按优先级来定位计算
         * @param dir
         * @param priority
         * @private
         */
        _cal: function (dir, priority) {
            var the = this;
            var options = the._options;
            var pos = {};
            var firstSide;
            var secondSide;
            /**
             * 靠边检测
             * @param type
             * @param firstSide
             * @param secondSide
             * @returns {*}
             */
            var sideCheck = function (type, firstSide, secondSide) {
                var list = [firstSide, secondSide];
                var findSide = null;

                dato.each(list, function (index, side) {
                    pos[type] = side;

                    if (the._check(pos)) {
                        findSide = side;
                        return false;
                    }
                });

                if (findSide === null) {
                    findSide = firstSide;
                }

                pos[type] = findSide;
            };

            if (priority === 'center') {
                switch (dir) {
                    case 'bottom':
                        pos.left = the._target.left + the._target.width / 2 - the._popup.width / 2;
                        pos.top = the._target.top + the._target.height + options.size;
                        break;

                    case 'right':
                        pos.left = the._target.left + the._target.width + options.size;
                        pos.top = the._target.top + the._target.height / 2 - the._popup.height / 2;
                        break;

                    case 'top':
                        pos.left = the._target.left + the._target.width / 2 - the._popup.width / 2;
                        pos.top = the._target.top - options.size - the._popup.height;
                        break;

                    case 'left':
                        pos.left = the._target.left - options.size - the._popup.width;
                        pos.top = the._target.top + the._target.height / 2 - the._popup.height / 2;
                        break;
                }
            } else {
                switch (dir) {
                    case 'bottom':
                        pos.top = the._target.top + the._target.height + options.size;
                        firstSide = the._target.left;
                        secondSide = the._target.left + the._target.width - the._popup.width;
                        sideCheck('left', firstSide, secondSide);
                        break;

                    case 'right':
                        pos.left = the._target.left + the._target.width + options.size;
                        firstSide = the._target.top;
                        secondSide = the._target.top + the._target.height - the._popup.height;
                        sideCheck('top', firstSide, secondSide);
                        break;

                    case 'top':
                        pos.top = the._target.top - the._popup.height - options.size;
                        firstSide = the._target.left;
                        secondSide = the._target.left + the._target.width - the._popup.width;
                        sideCheck('left', firstSide, secondSide);
                        break;

                    case 'left':
                        pos.left = the._target.left - options.size - the._popup.width;
                        firstSide = the._target.top;
                        secondSide = the._target.top + the._target.height - the._popup.height;
                        sideCheck('top', firstSide, secondSide);
                        break;
                }
            }

            return pos;
        },


        /**
         * 检查是否完整显示
         * @param pos
         * @returns {boolean}
         * @private
         */
        _check: function (pos) {
            var the = this;

            if (pos.left < 0 || pos.top < 0) {
                return false;
            }

            return pos.left + the._popup.width <= the._document.width && pos.top + the._popup.height <= the._document.height;
        }
    });

    Popup.defaults = defaults;
    modification.importStyle(style);
    module.exports = Popup;
});