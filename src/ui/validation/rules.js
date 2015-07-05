/*!
 * 规则
 * @author ydr.me
 * @create 2015-07-02 14:28
 */


define(function (require, exports, module) {
    /**
     * @module ui/validation/rules
     * @requires utils/typeis
     * @requires utils/number
     * @requires utils/string
     * @requires utils/dato
     * @requires utils/howdo
     * @requires core/navigator/compatible
     */

    'use strict';

    var typeis = require('../../utils/typeis.js');
    var number = require('../../utils/number.js');
    var string = require('../../utils/string.js');
    var dato = require('../../utils/dato.js');
    var howdo = require('../../utils/howdo.js');
    var compatible = require('../../core/navigator/compatible.js');
    var win = window;
    var URL = compatible.html5('URL', win);

    module.exports = function (Validation) {

    };

    //// 允许文件类型
    //exports.accept = function (ruleValue) {
    //    return function (files, done) {
    //        var invalidIndexs = [];
    //        var isMultiple = _isMultiple(files);
    //
    //        if (!isMultiple) {
    //            files = [files];
    //        }
    //
    //        dato.each(files, function (index, file) {
    //            if (file && file.type && !string.glob(file.type, ruleValue, true)) {
    //                invalidIndexs.push(index + 1);
    //            }
    //        });
    //
    //        done(invalidIndexs.length ? '${path}' +
    //        (isMultiple ? '的第' + (invalidIndexs.join('、')) + '个' : '的') +
    //        '文件类型不合法' : null);
    //    };
    //};

    //exports.minSize = _createFileSize('<');
    //exports.maxSize = _createFileSize('>');
    //exports.minWidth = _createImageSizeFn('宽度', '<');
    //exports.maxWidth = _createImageSizeFn('宽度', '>');
    //exports.minHeight = _createImageSizeFn('高度', '<');
    //exports.maxHeight = _createImageSizeFn('高度', '>');

    // ====================================================================================


    /**
     * 判断是否为多值类型
     * @param obj
     * @returns {boolean}
     */
    function _isMultiple(obj) {
        return typeis.array(obj) || typeis(obj) === 'filelist';
    }


    /**
     * 创建资源尺寸匹配规则
     * @param type
     * @returns {Function}
     * @private
     */
    function _createFileSize(type) {
        var map = {
            '>': '超过',
            '<': '小于'
        };
        return function (ruleValue) {
            return function (files, done) {
                var invalidIndexs = [];
                var isMultiple = _isMultiple(files);

                if (!isMultiple) {
                    files = [files];
                }

                dato.each(files, function (index, file) {
                    switch (map[type]) {
                        case '>':
                            if (file.size > ruleValue) {
                                invalidIndexs.push(index + 1);
                            }

                            break;

                        case '<':
                            if (file.size < ruleValue) {
                                invalidIndexs.push(index + 1);
                            }

                            break;
                    }
                });

                done(invalidIndexs.length ? '${path}的' +
                (isMultiple ? '第' + (invalidIndexs.join('、')) + '个' : '') +
                '文件大小不能' + map[type] + number.abbr(ruleValue, 0, 1024).toUpperCase() + 'B' : null);
            };
        };
    }


    /**
     * 获取图片尺寸
     * @param file
     * @param callback
     * @returns {*}
     */
    function _getImageSize(file, callback) {
        var img = new Image();
        var url = win[URL].createObjectURL(file);

        if (img.complete) {
            return callback(null, img);
        }

        img.onload = function () {
            callback(null, img);
        };
        img.onerror = callback;
        img.src = url;
    }


    /**
     * 生成图片尺寸判断 fn
     * @param side
     * @param type
     * @returns {Function}
     * @private
     */
    function _createImageSizeFn(side, type) {
        return function (ruleValue) {
            return function (files, done) {
                var errorIndexs = [];
                var invalidIndexs = [];
                var isMultiple = _isMultiple(files);

                if (isMultiple) {
                    files = dato.toArray(files);
                } else {
                    files = [files];
                }

                var map = {
                    '<': '小于',
                    '>': '大于'
                };

                howdo.each(files, function (index, file, done) {
                    _getImageSize(file, function (err, img) {
                        if (err) {
                            errorIndexs.push(index);
                            return done(err);
                        }

                        var width = img.width;

                        switch (type) {
                            case '<':
                                if (width < ruleValue) {
                                    invalidIndexs.push(index + 1);
                                }
                                break;

                            case '>':
                                if (width > ruleValue) {
                                    invalidIndexs.push(index + 1);
                                }
                                break;
                        }

                        done();
                    });
                }).together(function () {
                    if (!errorIndexs.length && !invalidIndexs.length) {
                        return done(null);
                    }

                    var msg = '${path}的';
                    var part1 = '';
                    var part2 = '';

                    if (isMultiple) {
                        if (errorIndexs.length) {
                            part1 = '第' + errorIndexs.join('、') + '个文件不是图片类型';
                        }

                        if (invalidIndexs.length) {
                            if (part1) {
                                part2 = '，';
                            }

                            part2 += '第' + invalidIndexs.join('、') + '张图片' + side + '不能' + map[type] + ruleValue + '像素';
                        }
                    } else {
                        if (errorIndexs.length) {
                            part1 = '文件不是图片类型';
                        }

                        if (invalidIndexs.length) {
                            part2 = '图片' + side + '不能' + map[type] + ruleValue + '像素';
                        }
                    }

                    done(msg + part1 + part2);
                });
            };
        };
    }
});