/**
 * 选项卡
 * @author ydr.me
 * @create 2014-11-20 23:00
 */


define(function (require, exports, module) {
    /**
     * @module ui/tab/
     * @requires ui/
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
        index: 0,
        eventType: 'click',
        activeClass: 'active',
        itemSelector: 'li',
        triggerSelector: 'a'
    };
    var Tab = ui.create({
        constructor: function (eTab, options) {
            var the = this;

            the._eTab = selector.query(eTab)[0];
            the.className = 'tab';
            the._options = dato.extend(true, {}, defaults, options);
            the._index = the._options.index;
            the.update();
            the._initEvent();
        },


        /**
         * 更新节点信息
         */
        update: function () {
            var the = this;
            var options = the._options;

            the._eItems = selector.query(options.itemSelector, the._eTab);

            if (!the._eItems.length) {
                the._index = -1;
            }

            return the;
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var options = the._options;

            // 这里异步调用的原因是
            // 主线程执行完毕再执行这里
            // 此时，实例化已经完成，就能够读取实例上添加的属性了
            controller.nextTick(the._getActive, the);
            event.on(the._eTab, options.eventType, options.triggerSelector, the._ontrigger.bind(the));
        },


        /**
         * 改变当前 tab
         * @param index {Number} 切换的索引值
         */
        change: function (index) {
            var the = this;
            var options = the._options;

            the._ontrigger({
                target: selector.query(options.triggerSelector, the._eTab)[index]
            });
        },


        /**
         * 获取当前激活的 tab 和 未激活的 tab
         * @private
         */
        _getActive: function () {
            var the = this;

            if (!the._eItems.length) {
                return;
            }

            var options = the._options;
            var eActive = selector.query(options.triggerSelector, the._eItems[the._index])[0];
            var eActiveContent = selector.query(attribute.attr(eActive, 'href'))[0];

            the._toggleClass(the._eItems[the._index]);
            the._toggleClass(eActiveContent);

            /**
             * Tab 索引发生变化后
             * @event change
             * @param index {Number} 变化后的索引
             * @param eActiveTab {HTMLElement} 被激活的 tab 标签
             * @param eActiveContent {HTMLElement} 被激活的 tab 内容
             */
            the.emit('change', the._index, the._eItems[the._index], eActiveContent);
        },


        /**
         * 事件出发回调
         * @private
         */
        _ontrigger: function (eve) {
            var the = this;
            var options = the._options;
            var eTarget = selector.query(eve.target)[0];
            var eItem = selector.closest(eTarget, options.itemSelector)[0];

            if (!eItem) {
                return;
            }

            var triggerIndex = selector.index(eItem);

            if (eve.preventDefault) {
                eve.preventDefault();
            }

            if (triggerIndex !== the._index) {
                the._index = triggerIndex;
                the._getActive();
            }
        },


        /**
         * 批量切换 className
         * @param eActive
         * @private
         */
        _toggleClass: function (eActive) {
            var eSiblings = selector.siblings(eActive);
            var className = this._options.activeClass;

            attribute.addClass(eActive, className);
            attribute.removeClass(eSiblings, className);
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            // 卸载事件绑定
            event.un(the._eTab, the._options.eventType, the._ontrigger);
        }
    });
    Tab.defaults = defaults;


    /**
     * 实例化一个 Tab 选项卡
     * 基本的 DOM 结构为：
     * ul#tab>(li>a)*n
     * 选项卡改变的时候会触发`change`事件
     *
     * @example
     * var tab = new Tab('#tab');
     * tab.on('chnage', function(index, eActiveTab, eActiveContent){
     *     // do what
     * });
     */
    module.exports = Tab;
});