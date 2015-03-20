/*!
 * Pager
 * @author ydr.me
 * @create 2014-12-17 21:49
 */


define(function (require, exports, module) {
    /**
     * @module ui/Pager/
     * @requires ui/
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/touch
     * @requires utils/dato
     * @requires libs/Template
     */
    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var dato = require('../../utils/dato.js');
    var Template = require('../../libs/Template.js');
    var template = require('html!./template.html');
    var style = require('css!./style.css');
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
    var Pager = ui.create(function ($parent, options) {
        var the = this;

        the._$ele = selector.query($parent);

        if (!the._$ele.length) {
            throw new Error('instance element is empty');
        }

        the._$ele = the._$ele[0];
        the._options = dato.extend(true, {}, defaults, options);
        the._init();
    });

    Pager.defaults = defaults;


    /**
     * 初始化
     * @private
     */
    Pager.fn._init = function () {
        var the = this;

        attribute.addClass(the._$ele, the._options.addClass);
        the._initEvent();
        the.render();
    };


    /**
     * 初始化事件
     * @private
     */
    Pager.fn._initEvent = function () {
        var the = this;

        event.on(the._$ele, 'click', '.' + alienClass + '-page', the._onpage.bind(the));
    };


    /**
     * 翻页回调
     * @param eve
     * @private
     */
    Pager.fn._onpage = function (eve) {
        var the = this;
        var $ele = eve.target;
        var page = attribute.data($ele, 'page');

        if (!attribute.hasClass($ele, alienClass + '-disabled')) {
            page = dato.parseInt(page, 1);

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
    };


    /**
     * 渲染分页
     * @param [data] {Object} 分页数据
     * @param [data.page] {Number} 页码
     * @param [data.max] {Number} 最大页码
     */
    Pager.fn.render = function (data) {
        var the = this;
        var html = tpl.render(dato.extend(the._options, data));

        the._$ele.innerHTML = html;
        return the;
    };


    /**
     * 销毁实例
     */
    Pager.fn.destroy = function () {
        var the = this;

        event.un(the._$ele, 'click', the._onpage);
        the._$ele.innerHTML = '';
    };

    modification.importStyle(style);
    module.exports = Pager;
});