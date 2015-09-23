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
        ratio: 1,
        srcLeft: 0,
        srcTop: 0,
        srcWidth: null,
        srcHeight: null,
        drawLeft: 0,
        drawTop: 0,
        drawWidth: null,
        drawHeight: null
    };


    /**
     * 绘制图像
     * @param canvas {Object} 画布
     * @param img {Object} 图片对象，必须保证图片已经 onload 了
     * @param [options] {Object} 配置
     * @param [options.ratio=1] {Number} 图片倍数，默认单倍，视网膜屏幕下建议用双倍
     * @param [options.srcLeft] {Number} 源横坐标
     * @param [options.srcTop] {Number} 源纵坐标
     * @param [options.srcWidth] {Number} 源宽度
     * @param [options.srcHeight] {Number} 源高度
     * @param [options.drawLeft] {Number} 绘制横坐标
     * @param [options.drawTop] {Number} 绘制纵坐标
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

        if (typeis.empty(options.drawLeft)) {
            options.drawLeft = 0;
        }

        if (typeis.empty(options.drawTop)) {
            options.drawTop = 0;
        }

        if (typeis.empty(options.drawWidth)) {
            options.drawWidth = options.srcWidth / options.ratio;
        }

        if (typeis.empty(options.drawHeight)) {
            options.drawHeight = options.srcHeight / options.ratio;
        }

        context.drawImage(img,
            options.srcLeft, options.srcTop, options.srcWidth, options.srcHeight,
            options.drawLeft, options.drawTop, options.drawWidth, options.drawHeight);
    };
});