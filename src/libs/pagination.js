/*!
 * 分页计算
 * @author ydr.me
 * @create 2014-10-09 18:36
 */


define(function (require, exports, module) {
    /**
     * @module libs/pagination
     * @requires utils/dato
     * @requires utils/number
     * @requires utils/class
     */
    'use strict';

    var dato = require('./../utils/dato.js');
    var number = require('./../utils/number.js');
    var klass = require('./../utils/class.js');
    var defaults = {
        max: 1,
        page: 1,
        size: 3
    };
    var Pagination = klass.create({
        constructor: function (options) {
            this._options = dato.extend(!0, {}, defaults, options);
            this.className = 'pagination';
        },

        /**
         * 返回分页列表
         * @returns {Array}
         */
        getList: function () {
            var the = this;
            var options = the._options;
            var list = [];
            var i;
            var j;
            var offset;
            var remainLeft = 0;
            var remainRight = 0;

            options.max = Math.abs(number.parseInt(options.max, 1));
            options.page = Math.abs(number.parseInt(options.page, 1));
            options.page = options.page > options.max ? options.max : options.page;
            options.size = Math.abs(number.parseInt(options.size, 3));
            options.size += options.size % 2 ? 0 : 1;
            offset = Math.floor(options.size / 2);

            // 小于可视范围
            if (options.max <= options.size) {
                for (i = 1; i <= options.max; i++) {
                    list.push({
                        page: i,
                        active: i === options.page
                    });
                }
            }
            // 大于可视范围
            else {
                if (options.page > 1) {
                    list.push({
                        type: 'prev',
                        page: options.page - 1
                    });
                }

                // 先判断剩余在哪边
                i = options.page - offset;
                j = options.page + offset;


                // 剩左边
                if (i < 1) {
                    remainLeft = -i + 1;
                    i = 1;
                }
                // 剩右边
                else if (j > options.max) {
                    remainRight = j - options.max;
                    i -= remainRight;
                    if (i < 1) {
                        i = 1;
                    }
                }

                // 首页
                if (i !== 1) {
                    list.push({
                        page: 1
                    });
                }

                if (i > 2) {
                    list.push({
                        type: 'ellipsis'
                    });
                }

                // 当前之前
                for (; i < options.page; i++) {
                    list.push({
                        page: i
                    });
                }

                // 当前
                list.push({
                    page: options.page,
                    active: !0
                });

                // 当前之后
                i = options.page + 1;
                j = i + offset + remainLeft;

                if (j > options.max) {
                    j = options.max;
                }

                for (; i < j; i++) {
                    list.push({
                        page: i
                    });
                }

                if (i < options.max) {
                    list.push({
                        type: 'ellipsis'
                    });
                }

                // 尾页
                if (i <= options.max) {
                    list.push({
                        page: options.max
                    });
                }

                if (options.page < options.max) {
                    list.push({
                        type: 'next',
                        page: options.page + 1
                    });
                }
            }

            return list;
        }
    });

    Pagination.defaults = defaults;

    /**
     * 实例化一个分页器
     * @param [options] {Object} 配置
     * @param [options.max=1] {Number}  最大页码
     * @param [options.page=1] {Number} 当前页码
     * @param [options.size=3] {Number} 可视范围
     *
     * @example
     * var pagination = new Pagination(options);
     */
    module.exports = Pagination;
});