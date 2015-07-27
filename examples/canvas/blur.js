/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-24 11:59
 */


define(function (require, exports, module) {
    /**
     * @module parent/blur
     */

    'use strict';

    var canvasBlur = require('../../src/canvas/blur.js');
    var canvasImg = require('../../src/canvas/img.js');
    var img = document.getElementById('img');
    var canvas = document.getElementById('canvas');

    var img2 = new Image();

    img2.src = img.src;
    img2.onload = function () {
        var width = 549;
        var height = 302;

        canvasImg(canvas, img2, {
            srcX: 0,
            srcY: 0,
            srcWidth: 200,
            srcHeight: 200,
            drawX: 0,
            drawY: 0,
            drawWidth: 549,
            drawHeight: 302
        });
        canvasBlur(canvas, {
            radius: 20,
            blurX: 0,
            blurY: 0,
            blurWidth: 549/2,
            blurHeight: 302/2
        });
    };
});