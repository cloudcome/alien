/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-05 16:10
 */


define(function (require, exports, module) {
    /**
     * @module parent/event
     */

    'use strict';

    var dato = require('./dato.js');
    var typeis = require('./typeis.js');

    var defaultFilter = function (file) {
        return /^image\//.test(file.type);
    };

    /**
     * 解析事件携带的 files
     * @param eve
     * @param items
     * @param filter
     * @returns {Array}
     */
    var parseEventOfFiles = function (eve, items, filter) {
        var files = [];

        if (!typeis.Function(filter)) {
            filter = defaultFilter;
        }

        dato.each(items, function (index, item) {
            if (item.kind === 'file') {
                var file = item.getAsFile();

                if (file && file.size > 0 && filter(file)) {
                    files.push(file);
                }
            }
        });

        return files;
    };


    /**
     * 解析事件内携带的文件
     * @param eve
     * @param ele
     * @param [filter]
     * @returns {Array}
     */
    exports.parseFiles = function (eve, ele, filter) {
        eve = eve.originalEvent || eve;

        if (eve.dataTransfer && eve.dataTransfer.items) {
            return parseEventOfFiles(eve, eve.dataTransfer && eve.dataTransfer.items, filter);
        } else if (eve.clipboardData && eve.clipboardData.items) {
            return parseEventOfFiles(eve, eve.clipboardData && eve.clipboardData.items, filter);
        } else if (ele.files) {
            return parseEventOfFiles(eve, ele.files, filter);
        }

        return [];
    };
});