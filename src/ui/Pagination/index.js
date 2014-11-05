/*!
 * Pagination.js
 * @author ydr.me
 * @create 2014-10-10 22:36
 */


define(function (require, exports, module) {
    /**
     * @module ui/Pagination
     * @requires util/class
     * @requires util/data
     * @requires libs/Pagination
     * @requires libs/Emitter
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/touch
     */
    'use strict';

    var style = require('css!./style.css');
    var klass = require('../../util/class.js');
    var data = require('../../util/data.js');
    var libsPagination = require('../../libs/Pagination.js');
    var Emitter = require('../../libs/Emitter.js');
    var Template = require('../../libs/Template.js');
    var template = require('html!./template.html');
    var tpl = new Template(template);
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var regPage = /{page}/g;
    var regText = /{text}/g;
    var regClass = /{class}/g;
    var itemClass = 'alien-ui-pagination-item';
    var normalClass = 'alien-ui-pagination-normal';
    var template = {
        prev: '上一页',
        next: '下一页',
        normal: '<div class="' + itemClass + '{class}" data-page="{page}">{text}</div>',
        disabled: '<div class="' + itemClass + ' alien-ui-pagination-disabled">...</div>'
    };
    var defaults = {
        count: 1,
        page: 1,
        size: 3
    };
    var Pagination = klass.create({
        STATIC: {
            /**
             * 默认配置
             * @name defaults
             * @property [count=1] {Number} 分页总数
             * @property [page=1] {Number} 当前分数
             * @property [size=3] {Number} 分页可见范围
             */
            defaults: defaults
        },


        constructor: function (ele, options) {
            var the = this;


            the._$ele = selector.query(ele);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = the._$ele[0];
            Emitter.apply(the, arguments);
            the._options = data.extend(!0, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._on();
            the.render();

            return the;
        },


        _on: function () {
            var the = this;

            event.on(the._$ele, 'click tap', '.' + normalClass, the._onEle.bind(the));
        },

        _onEle: function (eve) {
            var page = attribute.data(eve.target, 'page');

            this.emit('change', page);
        },

        _un: function () {
            var the = this;

            event.un(the._$ele, 'click tap', the._onEle);
        },

        /**
         * 渲染
         * @param {Object} [settings] 配置参数
         * @param {Number} [settings.count] 重新配置总页数，默认为上一次配置的值
         * @param {Number} [settings.page] 重新配置当前页数，默认为上一次配置的值
         * @param {Number} [settings.size] 重新配置可视范围，默认为上一次配置的值
         * @returns {Pagination}
         */
        render: function (settings) {
            var the = this;
            var options = data.extend(the._options, settings);
            var list = new libsPagination(options);

            the._$ele.innerHTML = tpl.render({
                pagination: list
            });

            //var html = ['<div class="alien-ui-pagination">'];
            //list.forEach(function (item) {
            //    switch (item.type) {
            //        case 'ellipsis':
            //            html.push(template.disabled);
            //            break;
            //
            //        case 'prev':
            //            html.push(template.normal
            //                .replace(regPage, item.page)
            //                .replace(regText, template.prev)
            //                .replace(regClass, ' ' + normalClass));
            //            break;
            //
            //        case 'next':
            //            html.push(template.normal
            //                .replace(regPage, item.page)
            //                .replace(regText, template.next)
            //                .replace(regClass, ' ' + normalClass));
            //            break;
            //
            //        default:
            //            html.push(template.normal
            //                .replace(regPage, item.page)
            //                .replace(regText, item.page)
            //                .replace(regClass, item.active ? ' alien-ui-pagination-active' : ' ' + normalClass));
            //            break;
            //    }
            //});
            //
            //html.push('</div>');
            //
            //the._$ele.innerHTML = html.join('');

            return the;
        },


        /**
         * 销毁
         */
        destroy: function () {
            var the = this;

            the._un();
            the._$ele.innerHTML = '';
        }
    }, Emitter);

    modification.importStyle(style);


    /**
     * 实例化一个分页控制器
     * @param ele {Element} 元素，生成的分页将在此渲染
     * @param [options] {Object} 配置
     * @param [options.count=1] {Number} 分页总数
     * @param [options.page=1] {Number} 当前分数
     * @param [options.size=3] {Number} 分页可见范围
     * @constructor
     */
    module.exports = Pagination;
});