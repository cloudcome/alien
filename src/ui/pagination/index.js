/*!
 * Pagination.js
 * @author ydr.me
 * @create 2014-10-10 22:36
 */


define(function (require, exports, module) {
    /**
     * @module ui/pagination/
     * @requires ui/
     * @requires utils/dato
     * @requires utils/number
     * @requires libs/pagination
     * @requires libs/template
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/touch
     */
    'use strict';

    var ui = require('../');
    var style = require('./style.css', 'css');
    var template = require('./template.html', 'html');
    var dato = require('../../utils/dato.js');
    var number = require('../../utils/number.js');
    var libsPagination = require('../../libs/pagination.js');
    var Template = require('../../libs/template.js');
    var tpl = new Template(template);
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var normalClass = 'alien-ui-pagination-normal';
    var defaults = {
        addClass: '',
        max: 1,
        page: 1,
        size: 3
    };
    var Pagination = ui.create({
        constructor: function ($parent, options) {
            var the = this;


            the._$ele = selector.query($parent);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = the._$ele[0];
            the._options = dato.extend(!0, {}, defaults, options);
            the.destroyed = false;
            the.className = 'pagination';
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

            event.on(the._$ele, 'click', '.' + normalClass, the._onpage.bind(the));
        },


        /**
         * 翻页回调
         * @param eve
         * @private
         */
        _onpage: function (eve) {
            var the = this;
            var page = attribute.data(eve.target, 'page');

            page = number.parseInt(page, 1);

            if (page !== the._options.page) {
                the._options.page = page;

                /**
                 * 页码变化后
                 * @event change
                 * @param page {Number} 变化后的页码
                 */
                the.emit('change', page);
            }
        },


        /**
         * 渲染
         * @param {Object} [data] 分页数据
         * @param {Number} [data.max] 重新配置总页数，默认为上一次配置的值
         * @param {Number} [data.page] 重新配置当前页数，默认为上一次配置的值
         * @param {Number} [data.size] 重新配置可视范围，默认为上一次配置的值
         * @returns {Pagination}
         */
        render: function (data) {
            var the = this;
            var options = dato.extend(the._options, data);
            var list = new libsPagination(options).getList();

            the._$ele.innerHTML = tpl.render(dato.extend(options, {
                pagination: list
            }));

            return the;
        },


        /**
         * 销毁
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

    ui.importStyle(style);


    /**
     * 实例化一个分页控制器
     * @param ele {Element} 元素，生成的分页将在此渲染
     * @param [options] {Object} 配置
     * @param [options.max=1] {Number} 分页总数
     * @param [options.page=1] {Number} 当前分数
     * @param [options.size=3] {Number} 分页可见范围
     * @constructor
     */
    module.exports = Pagination;
});