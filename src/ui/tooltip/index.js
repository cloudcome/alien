/*!
 * 提示UI
 * @author ydr.me
 * @create 2014-10-16 21:41
 */


define(function (require, exports, module) {
    /**
     * @module ui/tooltip/
     * @requires ui/
     * @requires ui/popup/
     * @requires utils/dato
     * @requires libs/template
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires core/event/base
     */
    'use strict';

    var ui = require('../');
    var Popup = require('../popup/');
    var style = require('./style.css', 'css');
    var dato = require('../../utils/dato.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/base.js');
    var alienClass = 'alien-ui-tooltip';
    var doc = window.document;
    var defaults = {
        duration: 123,
        easing: 'out-quart',
        selector: '.tooltip',
        // 标签的 data 值，即“data-tooltip”，否则读取 图片的 alt 属性，或者 innerText 值
        data: 'tooltip',
        // 触发打开、关闭事件类型
        openEvent: 'mouseover',
        closeEvent: 'mouseout',
        // 超时消失时间
        timeout: 300
    };
    var Tooltip = ui.create({
        constructor: function (options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the.destroyed = false;
            the.className = 'tooltip';
            the._initEvent();
        },


        _initEvent: function () {
            var the = this;
            var options = the._options;
            var popupKey = alienClass + '-popup';
            var timeIdKey = alienClass + '-timeid';
            var lastEle = null;

            event.on(doc, options.openEvent, options.selector, the._onTooltip = function () {
                var ele = this;
                var content = attribute.data(ele, options.data) || attribute.attr(ele, 'alt') || attribute.text(ele);
                var popup;

                // 上次和本次是同一个
                if (lastEle === ele) {
                    popup = ele[popupKey];
                    clearTimeout(ele[timeIdKey]);
                    ele[timeIdKey] = 0;
                }
                // 上次和本次不是同一个
                else {
                    lastEle = ele;
                }

                if (!popup) {
                    popup = ele[popupKey] = new Popup(ele, {
                        position: 'top',
                        addClass: alienClass,
                        arrowSize: 5,
                        offset: {
                            left: 5,
                            top: 5
                        },
                        style: {
                            maxWidth: 300
                        }
                    });
                }

                popup.setContent(content).open();
            });

            event.on(doc, options.closeEvent, options.selector, the._offTooltip = function () {
                var ele = this;

                // 如果未计时
                if (!ele[timeIdKey]) {
                    ele[timeIdKey] = setTimeout(function () {
                        ele[timeIdKey] = 0;

                        if (ele[popupKey]) {
                            ele[popupKey].destroy();
                            ele[popupKey] = null;
                        }
                    }, options.timeout);
                }
            });
        },

        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;
            var options = the._options;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            event.un(doc, options.openEvent, the._onTooltip);
            event.un(doc, options.closeEvent, the._offTooltip);
            the._popup.destroy();
        }
    });

    Tooltip.defaults = defaults;
    module.exports = Tooltip;
    ui.importStyle(style);
});