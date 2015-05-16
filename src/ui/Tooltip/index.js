/*!
 * 提示UI
 * @author ydr.me
 * @create 2014-10-16 21:41
 */


define(function (require, exports, module) {
    /**
     * @module ui/Tooltip/
     * @requires ui/
     * @requires utils/dato
     * @requires libs/Template
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires core/event/base
     */
    'use strict';

    var ui = require('../');
    var Popup = require('../Popup/');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var dato = require('../../utils/dato.js');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/base.js');
    var alienIndex = 0;
    var alienClass = 'alien-ui-tooltip';
    var doc = window.document;
    var defaults = {
        duration: 123,
        easing: 'out-quart',
        selector: '.tooltip',
        // 标签的 data 值，即“data-tooltip”
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
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;

            the._popup = new Popup(null, {
                position: 'top',
                addClass: alienClass + '-popup',
                arrowSize: 5,
                offset: 5,
                style: {
                    maxWidth: 300
                }
            });
            the._$lastEle = null;
            the._timeid = 0;

            event.on(doc, options.openEvent, options.selector, the._onTooltip = function () {
                var $ele = this;
                var content = attribute.data($ele, options.data) || $ele.innerHTML;

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
                }, options.duration);
            });
        }
    });

    Tooltip.defaults = defaults;
    module.exports = Tooltip;
    modification.importStyle(style);
});