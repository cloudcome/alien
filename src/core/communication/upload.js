/*!
 * upload.js
 * @author ydr.me
 * @create 2014-10-09 15:29
 */


define(function (require, exports, module) {
    /**
     * @module core/communication/upload
     * @requires utils/typeis
     * @requires utils/dato
     * @requires core/communication/xhr
     */
    'use strict';

    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var klass = require('../../utils/class.js');
    var Emitter = require('../../libs/emitter.js');
    var xhr = require('./xhr.js');
    var defaults = {
        method: 'post',
        url: location.href,
        body: null,
        // 如：'file'
        blobName: null,
//        如：'example.png'
//        fileName: null,
        file: null,
        /**
         * input files 过滤器
         * @param index
         * @param file
         * @returns {boolean}
         */
        filter: function (index, file) {
            return true;
        }
    };


    var Upload = klass.extends(Emitter).create({
        constructor: function (options) {
            var the = this;

            options = dato.extend(true, {}, defaults, options);

            if (!options.file) {
                throw new Error('require param `file`');
            }

            var fileType = typeis(options.file);
            var files;
            var fd = new FormData();
            var name = options.blobName;
            var hasFile = false;

            switch (fileType) {
                case 'element':
                    if (options.file.tagName !== 'INPUT' || options.file.type !== 'file') {
                        throw new Error('element tag must be a input file');
                    }

                    name = options.file.name;
                    files = options.file.files || [];

                    if (files.length === 1) {
                        /**
                         * 文件过滤
                         * @event filter
                         * @param index {Number} 文件索引值
                         * @param file {Object} 文件对象
                         */
                        if (the.emit('filter', 0, files[0]) !== false) {
                            fd.append(name, files[0]);
                            hasFile = true;
                        }
                    } else {
                        dato.each(options.file.files, function (index, file) {
                            /**
                             * 文件过滤
                             * @event filter
                             * @param index {Number} 文件索引值
                             * @param file {Object} 文件对象
                             */
                            if (the.emit('filter', index, file) !== false) {
                                fd.append(name + '[]', file);
                                hasFile = true;
                            }
                        });
                    }

                    if (!hasFile) {
                        return the.emit('error', new Error('no files can be upload'));
                    }

                    break;

                case 'blob':
                    if (!options.blobName) {
                        throw new Error('require param `blobName`');
                    }

                    fd.append(name, options.file);
                    break;
            }

            dato.each(options.body, function (key, val) {
                fd.append(key, val);
            });

            options.body = fd;

            Emitter.pipe(xhr, the);
        }
    });

    module.exports = function (options) {
        return new Upload(options);
    };
    module.exports.defaults = defaults;
});