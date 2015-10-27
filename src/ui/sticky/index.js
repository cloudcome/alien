/*!
 * 滚动固定
 * @author ydr.me
 * @create 2015-03-19 10:43
 */


define(function (require, exports, module) {
    /**
     * @module ui/stickly/
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/event/touch
     * @requires utils/dato
     * @requires utils/controller
     */
    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var dato = require('../../utils/dato.js');
    var controller = require('../../utils/controller.js');
    var defaults = {
        containerSelector: 'parent',
        scrollerSelector: window,
        className: 'sticky',
        event: 'scroll touchmove touchcancel touchcancel',
        wait: 30,
        position: {
            top: 0,
            right: 0,
            left: 0
        }
    };
    var Sticky = ui.create({
        constructor: function ($ele, options) {
            var the = this;

            the._$ele = selector.query($ele)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._$container = the._options.containerSelector === 'parent' ?
                selector.parent(the._$ele)[0] :
                selector.query(the._options.containerSelector)[0];
            the._$scroller = selector.query(the._options.scrollerSelector)[0];
            the.destroyed = false;
            the.className = 'sticky';
            the._initNode();
            the._initEvent();
        },


        _initNode: function () {
            var the = this;

            if (attribute.css(the._$container, 'position') === 'static') {
                attribute.css(the._$container, 'position', 'relative');
            }

            attribute.css(the._$ele, the._options.position);
        },


        _initEvent: function () {
            var the = this;
            var options = the._options;

            the._listening = false;
            the._onscroll = controller.throttle(the._sticky.bind(the), options.wait);
            event.on(the._$scroller, options.event, the._onscroll.bind(the));
            controller.nextTick(the._sticky.bind(the));
        },


        _sticky: function () {
            var the = this;
            var options = the._options;
            var scrollerTop = attribute.scrollTop(the._$scroller);

            the.update(false);

            if (scrollerTop > the._containerSize.top && scrollerTop < the._containerSize.top + the._containerSize.height) {
                attribute.addClass(the._$ele, options.className);
                attribute.css(the._$ele, 'position', 'fixed');
                /**
                 * 固定定位了
                 */
                the.emit('fixed');
            } else {
                attribute.removeClass(the._$ele, options.className);
                attribute.css(the._$ele, 'position', 'absolute');
                /**
                 * 绝对定位了
                 */
                the.emit('absolute');
            }
        },


        /**
         * 更新内容、滚动区域尺寸
         * @param [isSticky=true] {Boolean} 是否触发 sticky
         * @returns {Sticky}
         */
        update: function (isSticky) {
            var the = this;

            the._containerSize = {
                height: attribute.outerHeight(the._$container),
                top: attribute.top(the._$container)
            };

            if (the._listening && isSticky !== false) {
                the._sticky();
            }

            the._listening = true;
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
            event.un(the._$scroller, the._options.event, the._onscroll);
        }
    });


    Sticky.defaults = defaults;
    /**
     * 滚动区域内固定
     */
    module.exports = Sticky;
});