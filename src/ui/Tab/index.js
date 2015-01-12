/*!
 * 选项卡
 * @author ydr.me
 * @create 2014-11-20 23:00
 */


define(function (require, exports, module) {
    /**
     * @module ui/Tab/
     * @requires ui/base
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/event/touch
     * @requires util/dato
     */
    'use strict';

    var ui = require('../base.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var dato = require('../../util/dato.js');
    var defaults = {
        index: 0,
        event: 'click tap',
        activeClass: 'active'
    };
    var Tab = ui.create({
        constructor: function ($ele, options) {
            var the = this;

            the._$ele = selector.query($ele);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = the._$ele[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._initData();
            the._initEvent();
        },


        /**
         * 初始化数据
         * @private
         */
        _initData: function () {
            var the = this;

            the._index = the._options.index;
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var eventType = the._options.event;

            // 这里异步调用的原因是
            // 主线程执行完毕再执行这里
            // 此时，实例化已经完成，就能够读取实例上添加的属性了
            setTimeout(function () {
                the._getActive();
            }, 0);
            event.on(the._$ele, eventType, 'a', the._ontrigger.bind(the));
        },


        /**
         * 获取当前激活的 tab 和 未激活的 tab
         * @private
         */
        _getActive: function () {
            var the = this;
            var $activeTab = selector.children(the._$ele)[the._index];
            var $active = selector.query('a', $activeTab)[0];
            var $activeContent = selector.query(attribute.attr($active, 'href'));

            $activeContent = $activeContent.length ? $activeContent[0] : null;
            the._toggleClass($activeTab);
            the._toggleClass($activeContent);
            the.emit('change', the._index, $activeTab, $activeContent);
        },


        /**
         * 事件出发回调
         * @private
         */
        _ontrigger: function (eve) {
            var the = this;
            var $li = selector.closest(eve.target, 'li');
            var triggerIndex = selector.index($li[0]);

            eve.preventDefault();

            if(triggerIndex !== the._index){
                the._index = triggerIndex;
                the._getActive();
            }
        },


        /**
         * 批量切换 className
         * @param $active
         * @private
         */
        _toggleClass: function ($active) {
            var $siblings = selector.siblings($active);
            var className = this._options.activeClass;

            attribute.addClass($active, className);

            dato.each($siblings, function (index, $ele) {
                attribute.removeClass($ele, className);
            });
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;
            var eventType = the._options.event;

            // 卸载事件绑定
            event.un(the._$ele, eventType, the._ontrigger);
        }
    });


    /**
     * 实例化一个 Tab 选项卡
     * 基本的 DOM 结构为：
     * ul#tab>(li>a)*n
     * 选项卡改变的时候会触发`change`事件
     *
     * @example
     * var tab = new Tab('#tab');
     * tab.on('chnage', function(index, $tab, $content){
     *     // do what
     * });
     */
    module.exports = Tab;
});