/*!
 * Pagination.js
 * @author ydr.me
 * @create 2014-10-10 22:36
 */


define(function (require, exports, module) {
    /**
     * @module ui/Pagination
     * @requires ui/generator
     * @requires util/dato
     * @requires libs/Pagination
     * @requires libs/Template
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/touch
     */
    'use strict';

    var generator = require('../generator.js');
    var style = require('css!./style.css');
    var template = require('html!./template.html');
    var dato = require('../../util/dato.js');
    var libsPagination = require('../../libs/Pagination.js');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/touch.js');
    var normalClass = 'alien-ui-pagination-normal';
    var defaults = {
        count: 1,
        page: 1,
        size: 3
    };
    var Pagination = generator({
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
            the._options = dato.extend(!0, {}, defaults, options);
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
            var options = dato.extend(the._options, settings);
            var list = new libsPagination(options);

            the._$ele.innerHTML = tpl.render({
                pagination: list
            });

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
    });

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