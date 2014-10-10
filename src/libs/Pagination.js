/*!
 * Pagination.js
 * @author ydr.me
 * @create 2014-10-09 18:36
 */


define(function (require, exports, module) {
    /**
     * @module util/Pagination
     */
    'use strict';

    var data = require('./../util/data.js');
    var klass = require('./../util/class.js');
    var defaults = {
        count: 1,
        page: 1,
        size: 3
    };
    var Pagination = klass.create({
        STATIC: {
            defaults: defaults
        },
        constructor: function (options) {
            this._options = data.extend(!0, {}, defaults, options);
        },
        init: function () {
            var the = this;
            var options = the._options;
            var list = [];
            var i = 1;
            var offset;

            options.count = Math.abs(data.parseInt(options.count, 1));
            options.page = Math.abs(data.parseInt(options.page, 1));
            options.page = options.page > options.count ? options.count : options.page;
            options.size = Math.abs(data.parseInt(options.size, 3));
            options.size += options.size % 2 ? 0 : 1;
            offset = Math.floor(options.size / 2);

            // 小于可视范围
            if (options.count <= options.size) {
                for (; i <= options.count; i++) {
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

                // 左边
                if (options.page < options.size) {
                    for (; i <= options.size; i++) {
                        list.push({
                            page: i,
                            active: i === options.page
                        });
                    }

                    if (i < options.count) {
                        list.push({
                            type: 'ellipsis'
                        });
                    }

                    if (options.page < options.count) {
                        list.push({
                            page: options.count,
                            active: !1
                        });
                    }
                }
                // 右边
                else if (options.page > options.count - offset) {
                    list.push({
                        page: 1,
                        active: !1
                    });

                    i = options.page - options.size + 1;

                    if (i - 1 > 1) {
                        list.push({
                            type: 'ellipsis'
                        });
                    }

                    for (; i <= options.count; i++) {
                        list.push({
                            page: i,
                            active: i === options.page
                        });
                    }
                }
                // 中间
                else {
                    list.push({
                        page: 1,
                        active: !1
                    });

                    i = options.page - offset;

                    if (i - 1 > 1) {
                        list.push({
                            type: 'ellipsis'
                        });
                    }

                    for (; i <= options.page + offset; i++) {
                        list.push({
                            page: i,
                            active: i === options.page
                        });
                    }

                    if (i < options.count) {
                        list.push({
                            type: 'ellipsis'
                        });
                    }

                    if (options.page < options.count) {
                        list.push({
                            page: options.count,
                            active: !1
                        });
                    }
                }

                if (options.page < options.count) {
                    list.push({
                        type: 'next',
                        page: options.page + 1
                    });
                }
            }

            return list;
        }
    });

    module.exports = Pagination;
});