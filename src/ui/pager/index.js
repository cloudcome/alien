/*!
 * Pager
 * @author ydr.me
 * @create 2014-12-17 21:49
 */


define(function (require, exports, module) {
    /**
     * @module ui/pager/
     * @requires ui/
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/touch
     * @requires utils/dato
     * @requires utils/number
     * @requires libs/template
     */
    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var dato = require('../../utils/dato.js');
    var number = require('../../utils/number.js');
    var Template = require('../../libs/template.js');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var tpl = new Template(template);
    var defaults = {
        addClass: '',
        prev: '上一页',
        next: '下一页',
        // 默认为第 1 页
        page: 1,
        // 最大页数
        max: 1
    };
    var alienClass = 'alien-ui-pager';
    var Pager = ui.create({
        constructor: function ($parent, options) {
            var the = this;

            the._$ele = selector.query($parent);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = the._$ele[0];
            the._options = dato.extend(true, {}, defaults, options);
            the.destroyed = false;
            the.className = 'pager';
            attribute.addClass(the._$ele, the._options.addClass);
            the._initEvent();
            the.render();
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;

            event.on(the._$ele, 'click', '.' + alienClass + '-page', the._onpage.bind(the));
        },


        /**
         * 翻页回调
         * @param eve
         * @private
         */
        _onpage: function (eve) {
            var the = this;
            var $ele = eve.target;
            var page = attribute.data($ele, 'page');

            if (!attribute.hasClass($ele, alienClass + '-disabled')) {
                page = number.parseInt(page, 1);

                if (page !== the._options.page) {
                    the._options.page = page;

                    /**
                     * 页码变化后
                     * @event change
                     * @param page {Number} 变化后的页码
                     */
                    the.emit('change', the._options.page);
                }
            }
        },


        /**
         * 渲染分页
         * @param [data] {Object} 分页数据
         * @param [data.page] {Number} 页码
         * @param [data.max] {Number} 最大页码
         */
        render: function (data) {
            var the = this;

            the._$ele.innerHTML = tpl.render(dato.extend(the._options, data));
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
            event.un(the._$ele, 'click', the._onpage);
            the._$ele.innerHTML = '';
        }
    });
    Pager.defaults = defaults;
    ui.importStyle(style);
    module.exports = Pager;
});