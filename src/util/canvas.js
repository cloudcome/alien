/*!
 * 画布操作
 * @author ydr.me
 * @create 2014-10-28 11:09
 */


define(function (require, exports) {
    /**
     * @module util/canvas
     * @requires util/dato
     * @requires core/dom/modification
     * @requires core/navigator/compatible
     */
    'use strict';

    var dato = require('./dato.js');
    var modification = require('../core/dom/modification.js');
    var compatible = require('../core/navigator/compatible.js');
    var URL = window[compatible.html5('URL', window)];
    var saveAs = window[compatible.html5('saveAs', window)];
    var saveBlob = navigator[compatible.html5('saveBlob', navigator)];
    var defaults = {
        srcX: 0,
        srcY: 0,
        type: 'image/png',
        quality: 1
    };
    var udf;
    var supportToBlob = 'toBlob' in HTMLCanvasElement.prototype;

    /**
     * 将图片对象绘制到 canvas 上
     * @param $canvas {Element} canvas 对象
     * @param $img {HTMLImageElement} img 对象
     * @param options {Object} 参数
     * @param [options.srcX=0] {Number} 源图片区域起点 x 坐标，默认为0
     * @param [options.srcY=0] {Number} 源图片区域起点 y 坐标，默认为0
     * @param [options.srcWidth] {Number} 源图片区域宽度，默认为图片宽度
     * @param [options.srcHeight] {Number} 源图片区域高度，默认为图片高度
     * @param [options.drawWidth] {Number} 绘制图片区域宽度，默认为源图片区域宽度
     * @param [options.drawHeight] {Number} 绘制图片区域高度，默认为源图片区域高度
     * @param [options.type='image/png'] {String} 图片类型，可选'image/png,image/jpg,image/webp'
     * @param [options.quality=1] {Number} 图片质量，默认为1，仅当`type`为'image/jpg'或'image/webp'时有效
     * @param [isReturnCanvas=false] {Boolean} 是否返回 canvas 对象，默认false
     * @returns {String|HTMLElement} 图片的 base64 编码
     */
    exports.imgToBase64 = function ($img, options, isReturnCanvas) {
        var $canvas;
        var context;

        options = dato.extend(!0, {}, defaults, options);

        if (options.srcWidth === udf) {
            options.srcWidth = $img.width;
        }

        if (options.srcHeight === udf) {
            options.srcHeight = $img.height;
        }

        if (options.drawWidth === udf) {
            options.drawWidth = options.srcWidth;
        }

        if (options.drawHeight === udf) {
            options.drawHeight = options.srcHeight;
        }

        $canvas = modification.create('canvas', {
            width: options.drawWidth,
            height: options.drawHeight
        });

        //modification.insert($canvas, document.body, 'beforeend');
        context = $canvas.getContext('2d');
        context.drawImage($img, options.srcX, options.srcY, options.srcWidth, options.srcHeight, 0, 0, options.drawWidth, options.drawHeight);

        if (isReturnCanvas) {
            return $canvas;
        } else {
            //modification.remove($canvas);
            return $canvas.toDataURL(options.type, options.quality);
        }
    };


    /**
     * 图片转换为二进制对象
     * @param $img {HTMLImageELement} 图片对象
     * @param options {Object} 配置
     * @param [options.srcX=0] {Number} 源图片区域起点 x 坐标，默认为0
     * @param [options.srcY=0] {Number} 源图片区域起点 y 坐标，默认为0
     * @param [options.srcWidth] {Number} 源图片区域宽度，默认为图片宽度
     * @param [options.srcHeight] {Number} 源图片区域高度，默认为图片高度
     * @param [options.drawWidth] {Number} 绘制图片区域宽度，默认为源图片区域宽度
     * @param [options.drawHeight] {Number} 绘制图片区域高度，默认为源图片区域高度
     * @param [options.type='image/png'] {String} 图片类型，可选'image/png,image/jpg,image/webp'
     * @param [options.quality=1] {Number} 图片质量，默认为1，仅当`type`为'image/jpg'或'image/webp'时有效
     * @param callback {Function} 回调
     * @returns {*}
     */
    exports.imgToBlob = function ($img, options, callback) {
        var $canvas;
        var base64;

        options = dato.extend(!0, {}, defaults, options);

        // moz
        if (supportToBlob) {
            $canvas = exports.imgToBase64($img, options, !0);
            return $canvas.toBlob(callback, options.type, options.quality);
        } else {
            base64 = exports.imgToBase64($img, options, !1);
            callback(exports.base64toBlob(base64));
        }
    };


    /**
     * base64 转换为 Blob 实例
     * @ref http://stackoverflow.com/q/18253378
     * @param base64 {String} base64 编码
     * @returns {Blob}
     */
    exports.base64toBlob = function (base64) {
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
     * 保存二进制对象
     * @param $canvas {HTMLCanvasElement} canvas 对象
     * @param name {String} 文件名称
     * @param [options] {Object} 参数
     * @param [options.type='image/png'] {String} 图片类型
     * @param [options.quality=1] {Number} 图片质量
     */
    exports.saveAs = function ($canvas, name, options) {
        options = dato.extend(!0, {}, defaults, options);

        var base64 = $canvas.toDataURL(options.type, options.quality);
        var link = modification.create('a', {
            href: base64,
            download: name
        });
        var eve = document.createEvent("HTMLEvents");

        eve.initEvent('click', !1, !1);
        link.dispatchEvent(eve);
    };
});