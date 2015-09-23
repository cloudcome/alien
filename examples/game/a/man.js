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
    var controller = require('../../../src/utils/controller.js');
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
            options = the._options = dato.extend({}, defaults, options);
            var imgWidth = the._img.width / 2;
            var imgHeight = the._img.height / 2;
            the._pos = {
                width: imgWidth,
                height: imgHeight,
                left: (options.womenWidth - imgWidth) / 2,
                top: attribute.height(window) - imgHeight
            };
            attribute.attr(the._$canvas, the._pos);
            attribute.css(the._$canvas, the._pos);
            canvasImg(the._$canvas, the._img, {
                ratio: 2
            });
            the._initEvent();
        },


        _initEvent: function () {
            var the = this;
            var options = the._options;
            var left1 = 0;

            the._touch = new Touch(the._$canvas);
            the._touch.on('touch1start', function (eve) {
                left1 = attribute.left(the._$canvas);
            }).on('touch1move', function (eve) {
                var detail = eve.alienDetail;
                the._pos.left = left1 + detail.changedX;

                attribute.css(the._$canvas, 'left', the._pos.left);
                the.emit('change', the._pos);
            });

            controller.nextTick(function () {
                the.emit('change', the._pos);
            });
        }
    });

    Man.defaults = defaults;
    module.exports = Man;
});