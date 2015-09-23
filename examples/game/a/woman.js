/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-23 14:08
 */


define(function (require, exports, module) {
    'use strict';


    var selector = require('../../../src/core/dom/selector.js');
    var attribute = require('../../../src/core/dom/attribute.js');
    var klass = require('../../../src/utils/class.js');
    var dato = require('../../../src/utils/dato.js');
    var random = require('../../../src/utils/random.js');
    var Emitter = require('../../../src/libs/emitter.js');
    var canvasImg = require('../../../src/canvas/img.js');
    var defaults = {
    };
    var Woman = klass.extends(Emitter).create({
        constructor: function ($canvas, img, options) {
            var the = this;

            the._$canvas = selector.query($canvas)[0];
            the._img = img;
            the._options = dato.extend({}, defaults, options);
            the._imgWidth = the._img.width;
            the._imgHeight = the._img.height;
            the._canvasWidth = the._$canvas.width;
            the._canvasHeight = the._$canvas.height;
            the._maxLeft = the._canvasWidth - the._imgWidth;
            the._maxTop = the._canvasHeight;
            the._top = -the._imgHeight;
            the._left = random.number(0, the._maxLeft);
        },


        /**
         * 画
         * @returns {Woman}
         */
        draw: function () {
            var the = this;
            var options = the._options;

            if (!the._img) {
                return the;
            }

            the._top += 1;
            canvasImg(the._$canvas, the._img, {
                drawLeft: the._left,
                drawTop: the._top
            });

            if (the._top >= the._maxTop) {
                the.emit('leave');
            }

            return the;
        },


        /**
         * 获得当前位置
         * @returns {{width: Number, height: Number, left: Number, top: number}}
         */
        getPosition: function () {
            var the = this;

            return {
                width: the._imgWidth,
                height: the._imgHeight,
                left: the._left,
                top: the._top
            };
        },

        destroy: function () {
            //
        }
    });

    Woman.defaults = defaults;
    module.exports = Woman;
});