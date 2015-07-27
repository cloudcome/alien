/*!
 * 画布内容
 * @author ydr.me
 * @create 2015-07-24 17:36
 */


define(function (require, exports, module) {
    /**
     * @module canvas/content
     * @requires utils/dato
     * @requires utils/typeis
     */

    'use strict';

    var dato = require('../utils/dato.js');
    var typeis = require('../utils/typeis.js');
    var allocation = require('../utils/allocation.js');
    var modification = require('../core/dom/modification.js');
    var event = require('../core/event/base.js');
    var supportToBlob = 'toBlob' in HTMLCanvasElement.prototype;
    var defaults = {
        type: 'image/png',
        quality: 1
    };


    /**
     * base64 转换为 Blob 实例
     * @ref http://stackoverflow.com/q/18253378
     * @param base64 {String} base64 编码
     * @returns {Blob}
     */
    var base64toBlob = function (base64) {
        var i = 0;
        var byteString = atob(base64.split(',')[1]);
        var mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ua = new Uint8Array(ab);

        for (; i < byteString.length; i++) {
            ua[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], {
            type: mimeString
        });
    };

    /**
     * canvas 画布转换成 base64
     * @param canvas {Object} 画布
     * @param [options] {Object} 配置
     * @param [options.type] {Object} 类型
     * @param [options.quality] {Object} 质量
     * @returns {string}
     */
    exports.toBase64 = function (canvas, options) {
        options = dato.extend({}, defaults, options);

        return canvas.toDataURL(options.type, options.quality);
    };


    /**
     * canvas 画布转换成 blob
     * @param canvas {Object} 画布
     * @param [options] {Object} 配置
     * @param [options.type] {Object} 类型
     * @param [options.quality] {Object} 质量
     * @param callback {Function}
     * @returns {string}
     */
    exports.toBlob = function (canvas, options, callback) {
        var args = allocation.args(arguments);

        if (typeis.function(args[1])) {
            callback = args[1];
            options = {};
        }

        options = dato.extend({}, defaults, options);

        // moz
        if (supportToBlob) {
            return canvas.toBlob(callback, options.type, options.quality);
        } else {
            var base64 = exports.toBase64(canvas, options);
            callback(base64toBlob(base64));
        }
    };


    /**
     * 保存二进制对象
     * @param canvas {Object} 画布
     * @param name {String} 文件名称
     * @param [options] {Object} 参数
     * @param [options.type='image/png'] {String} 图片类型
     * @param [options.quality=1] {Number} 图片质量
     */
    exports.saveAs = function (canvas, name, options) {
        options = dato.extend({}, defaults, options);

        var base64 = canvas.toDataURL(options.type, options.quality);
        var link = modification.create('a', {
            href: base64,
            download: name
        });

        event.dispatch(link, 'click');
    };
});