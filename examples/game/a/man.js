/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-23 15:27
 */


define(function (require, exports, module) {
    'use strict';

    var selector = require('../../../src/core/dom/selector.js');
    var attribute = require('../../../src/core/dom/attribute.js');
    var ui = require('../../../src/ui/index.js');
    var Touch = require('../../../src/ui/touch/index.js');
    var klass = require('../../../src/utils/class.js');
    var dato = require('../../../src/utils/dato.js');
    var random = require('../../../src/utils/random.js');
    var Emitter = require('../../../src/libs/emitter.js');
    var canvasImg = require('../../../src/canvas/img.js');
    var defaults = {
        minLeft: 0,
        maxLeft: 320,
        top: 0,
        womenWidth: 320
    };
    var Man = klass.extends(Emitter).create({
        constructor: function ($canvas, img, options) {
            var the = this;

            the._$canvas = selector.query($canvas)[0];
            the._img = img;
            the._options = dato.extend({}, defaults, options);
            the._imgWidth = the._img.width;
            the._imgHeight = the._img.height;
            attribute.attr(the._$canvas, {
                width: the._imgWidth,
                height: the._imgHeight
            });
            the._top = the._canvasHeight - the._imgHeight;
            the._left = (the._canvasWidth - the._imgWidth) / 2;
            the._initEvent();
        },


        _initEvent: function () {
            var the = this;
            var options = the._options;

            the._touch = new Touch(the._$canvas);
        },


        _draw: function () {
            var the = this;
            var options = the._options;

            canvasImg(the._$canvas, the._img, {
                drawLeft: the._left,
                drawTop: the._top
            });
        }
    });

    Man.defaults = defaults;
    module.exports = Man;
});