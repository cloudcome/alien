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
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/touch
     */
    'use strict';

    var klass = require('../util/class.js');
    var data = require('../util/data.js');
    var List = require('../libs/Pagination.js');
    var Emitter = require('../libs/Emitter.js');
    var modification = require('../core/dom/modification.js');
    var attribute = require('../core/dom/attribute.js');
    var event = require('../core/event/touch.js');
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
    var noop = function () {
        // ignore
    };
    var defaults = {
        count: 1,
        page: 1,
        size: 3,
        onchange: noop
    };
    var Pagination = klass.create({
        constructor: function (ele, options) {
            Emitter.apply(this, arguments);
            this._ele = ele;
            this._options = data.extend(!0, {}, defaults, options);
        },


        /**
         * 初始化
         * @returns {Pagination}
         */
        init: function () {
            var the = this;

            the._on();
            the.render();

            return the;
        },


        _on: function () {
            var the = this;

            event.on(the._ele, 'click tap', '.' + normalClass, the._onEle.bind(the));
        },

        _onEle: function (eve) {
            var page = attribute.data(eve.target, 'page');

            this._options.onchange.call(this, page);
            this.emit('change', page);
        },

        _un: function () {
            var the = this;

            event.un(the._ele, 'click tap', the._onEle);
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
            var list = new List(options).init();
            var html = ['<div class="alien-ui-pagination">'];

            list.forEach(function (item) {
                switch (item.type) {
                    case 'ellipsis':
                        html.push(template.disabled);
                        break;

                    case 'prev':
                        html.push(template.normal
                            .replace(regPage, item.page)
                            .replace(regText, template.prev)
                            .replace(regClass, ' '+normalClass));
                        break;

                    case 'next':
                        html.push(template.normal
                            .replace(regPage, item.page)
                            .replace(regText, template.next)
                            .replace(regClass, ' '+normalClass));
                        break;

                    default:
                        html.push(template.normal
                            .replace(regPage, item.page)
                            .replace(regText, item.page)
                            .replace(regClass, item.active ? ' alien-ui-pagination-active' : ' '+normalClass));
                        break;
                }
            });

            html.push('</div>');

            the._ele.innerHTML = html.join('');

            return the;
        },


        /**
         * 销毁
         */
        destroy: function () {
            var the = this;

            the._un();
            the._ele.innerHTML = '';
        }
    }, Emitter);
    var style =
        '.alien-ui-pagination *{-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}' +
        '.alien-ui-pagination-item{display:inline-block;padding:10px;border:1px solid #ddd;min-width:20px;height:16px;line-height:16px;font-size:14px;font-weight:normal;border-right-width:0;color:#1E77B6;text-align:center;cursor:pointer}' +
        '.alien-ui-pagination-item:first-child{border-radius:4px 0 0 4px}' +
        '.alien-ui-pagination-item:last-child{border-right-width:1px;border-radius:0 4px 4px 0}' +
        '.alien-ui-pagination-item:hover{background:#eee}' +
        '.alien-ui-pagination-item:active{background:#ddd}' +
        '.alien-ui-pagination-disabled,.alien-ui-pagination-disabled:hover,.alien-ui-pagination-disabled:active{background:#fff;cursor:not-allowed;color: #777;}' +
        '.alien-ui-pagination-active,.alien-ui-pagination-active:hover,.alien-ui-pagination-active:active{background:#428bca;border-color:#428bca;color:#fff;cursor:default}' +
        '';

    modification.importStyle(style);

    module.exports = Pagination;
});