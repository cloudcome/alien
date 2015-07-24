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

    var blur = require('../../src/canvas/blur.js');
    var canvasHelper = require('../../src/utils/canvas.js');
    var img = document.getElementById('img');
    var canvas = document.getElementById('canvas');

    if(img.naturalWidth){
        blur(img.src, canvas, {
            radius: 20
        }, true);
    }
    //
    //img.onload = function () {
    //    blur(img, canvas, 1, true);
    //};
});