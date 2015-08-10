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

            options = the._options = dato.extend({}, defaults, options);
            the.destroyed = false;
            the._popup = new Popup(null, {
                position: 'top',
                addClass: alienClass + '-popup',
                arrowSize: 5,
                offset: {
                    left: 5,
                    top: 5
                },
                style: {
                    maxWidth: 300
                }
            });
            the._$lastEle = null;
            the._timeid = 0;

            event.on(doc, options.openEvent, options.selector, the._onTooltip = function () {
                var $ele = this;
                var content = attribute.data($ele, options.data) || attribute.text($ele);

                clearTimeout(the._timeid);

                if (the._$lastEle === $ele) {
                    return;
                }

                var onpop = function () {
                    the._popup.setContent(content).open($ele, function () {
                        the._$lastEle = $ele;
                    });
                };

                if (the._popup.visible) {
                    the._popup.close(onpop);
                } else {
                    onpop();
                }
            });

            event.on(doc, options.closeEvent, options.selector, the._offTooltip = function () {
                the._timeid = setTimeout(function () {
                    the._popup.close();
                    the._$lastEle = null;
                }, options.timeout);
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