/*!
 * 绘制图像
 * @author ydr.me
 * @create 2015-07-24 17:09
 */


define(function (require, exports, module) {
    /**
     * @module canvas/img
     * @requires utils/dato
     * @requires utils/typeis
     */

    'use strict';


    var dato = require('../utils/dato.js');
    var typeis = require('../utils/typeis.js');
    var defaults = {
        srcX: 0,
        srcY: 0,
        srcWidth: null,
        srcHeight: null,
        drawX: 0,
        drawY: 0,
        drawWidth: null,
        drawHeight: null
    };


    /**
     * 绘制图像
     * @param img {Object} 图片对象，必须保证图片已经 onload 了
     * @param canvas {Object} 画布
     * @param [options] {Object} 配置
     * @param [options.srcX] {Number} 源横坐标
     * @param [options.srcY] {Number} 源纵坐标
     * @param [options.srcWidth] {Number} 源宽度
     * @param [options.srcHeight] {Number} 源高度
     * @param [options.drawX] {Number} 绘制横坐标
     * @param [options.drawY] {Number} 绘制纵坐标
     * @param [options.drawWidth] {Number} 绘制宽度
     * @param [options.drawHeight] {Number} 绘制高度
     */
    module.exports = function (canvas, img, options) {
        var context = canvas.getContext('2d');

        options = dato.extend({}, defaults, options);

        if (typeis.empty(options.srcWidth)) {
            options.srcWidth = img.width;
        }

        if (typeis.empty(options.srcHeight)) {
            options.srcHeight = img.height;
        }

        if (typeis.empty(options.drawX)) {
            options.drawX = 0;
        }

        if (typeis.empty(options.drawY)) {
            options.drawY = 0;
        }

        if (typeis.empty(options.drawWidth)) {
            options.drawWidth = img.width;
        }

        if (typeis.empty(options.drawHeight)) {
            options.drawHeight = img.height;
        }

        context.drawImage(img,
            options.srcX, options.srcY, options.srcWidth, options.srcHeight,
            options.drawX, options.drawY, options.drawWidth, options.drawHeight);
    };
});