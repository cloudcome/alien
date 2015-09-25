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
        Validation.addRule('accept', function (val, done, param0) {
            var isRequired = this.getRuleParams(this.path, 'required');

            // 非必填并且是空值
            if (!isRequired && (!val || !val.length)) {
                return done(null);
            }

            var invalidIndexs = [];
            var isMultiple = _isMultiple(val);

            if (!isMultiple) {
                val = [val];
            }

            dato.each(val, function (index, file) {
                if (file && file.type && !string.glob(file.type, param0, true)) {
                    invalidIndexs.push(index + 1);
                }
            });

            done(invalidIndexs.length ? '${1}' +
            (isMultiple ? '的第' + (invalidIndexs.join('、')) + '个' : '的') +
            '文件类型不合法' : null);
        });


        Validation.addRule('pattern', function (val, done, param0) {
            val = val || '';

            var reg = new RegExp(param0);

            done(reg.test(val) ? null : '${1}不符合规则');
        });


        /**
         * 创建资源尺寸匹配规则
         * @param type
         * @returns {Function}
         * @private
         */
        var _createFileSize = function (type) {
            var map = {
                '>': '超过',
                '<': '小于'
            };

            return function (val, done, param0) {
                var invalidIndexs = [];
                var isMultiple = _isMultiple(val);

                if (!isMultiple) {
                    var isRequired = this.getRuleParams(this.path, 'required');

                    // 单值类型 && 空值 && 可选
                    if(!val && !isRequired){
                        return done();
                    }

                    val = [val];
                }

                dato.each(val, function (index, file) {
                    switch (map[type]) {
                        case '>':
                            if (file.size > param0) {
                                invalidIndexs.push(index + 1);
                            }

                            break;

                        case '<':
                            if (file.size < param0) {
                                invalidIndexs.push(index + 1);
                            }

                            break;
                    }
                });

                done(invalidIndexs.length ? '${1}的' +
                (isMultiple ? '第' + (invalidIndexs.join('、')) + '个' : '') +
                '文件大小不能' + map[type] + number.abbr(param0, 0, 1024).toUpperCase() + 'B' : null);
            };
        };

        Validation.addRule('minSize', _createFileSize('<'));
        Validation.addRule('maxSize', _createFileSize('>'));


        /**
         * 生成图片尺寸判断 fn
         * @param side
         * @param type
         * @returns {Function}
         * @private
         */
        var _createImageSizeFn = function (side, type) {
            var map = {
                '<': '小于',
                '>': '大于'
            };

            return function (val, done, param0) {
                var errorIndexs = [];
                var invalidIndexs = [];
                var isMultiple = _isMultiple(val);

                if (isMultiple) {
                    val = dato.toArray(val);
                } else {
                    var isRequired = this.getRuleParams(this.path, 'required');

                    // 单值类型 && 空值 && 可选
                    if(!val && !isRequired){
                        return done();
                    }

                    val = [val];
                }

                howdo.each(val, function (index, file, done) {
                    _getImageSize(file, function (err, img) {
                        if (err) {
                            errorIndexs.push(index);
                            return done(err);
                        }

                        var width = img.width;

                        switch (type) {
                            case '<':
                                if (width < param0) {
                                    invalidIndexs.push(index + 1);
                                }
                                break;

                            case '>':
                                if (width > param0) {
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

                    var msg = '${1}的';
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

                            part2 += '第' + invalidIndexs.join('、') + '张图片' + side + '不能' + map[type] + param0 + '像素';
                        }
                    } else {
                        if (errorIndexs.length) {
                            part1 = '文件不是图片类型';
                        }

                        if (invalidIndexs.length) {
                            part2 = '图片' + side + '不能' + map[type] + param0 + '像素';
                        }
                    }

                    done(msg + part1 + part2);
                });
            };
        };

        Validation.addRule('minWidth', _createImageSizeFn('宽度', '<'));
        Validation.addRule('maxWidth', _createImageSizeFn('宽度', '>'));
        Validation.addRule('minHeight', _createImageSizeFn('高度', '<'));
        Validation.addRule('maxHeight', _createImageSizeFn('高度', '>'));
    };


    // ====================================================================================
    // ====================================================================================
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
     * 获取图片尺寸
     * @param file
     * @param callback
     * @returns {*}
     */
    function _getImageSize(file, callback) {
        var img = new Image();
        var url = win[URL].createObjectURL(file);

        img.onload = function () {
            callback(null, img);
        };
        img.onerror = callback;
        img.src = url;
    }
});