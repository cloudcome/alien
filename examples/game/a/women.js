/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-23 14:26
 */


define(function (require, exports, module) {
    'use strict';

    var Woman = require('./woman.js');
    var selector = require('../../../src/core/dom/selector.js');
    var klass = require('../../../src/utils/class.js');
    var dato = require('../../../src/utils/dato.js');
    var random = require('../../../src/utils/random.js');
    var Emitter = require('../../../src/libs/emitter.js');
    var canvasImg = require('../../../src/canvas/img.js');
    var defaults = {
        // 单屏最大数量
        maxLength: 4,
        // 最小间隔 px
        minOffset: 100
    };
    var Women = klass.extends(Emitter).create({
        constructor: function ($canvas, img, options) {
            var the = this;

            the._$canvas = selector.query($canvas)[0];
            the._img = img;
            the._options = dato.extend({}, defaults, options);
            the._man = {
                width: 0,
                height: 0,
                left: 0,
                top: 0
            };
            the._women = [];
            the._map = {};
            the._imgHeight = the._img.height;
        },


        /**
         * 批量画
         * @returns {Women}
         */
        draw: function () {
            var the = this;
            var options = the._options;

            if (the._can()) {
                var woman = new Woman(the._$canvas, the._img, options);

                woman.__index = the._women.length;
                woman.on('leave', function () {
                    var _woman = this;

                    dato.each(the._women, function (index, woman) {
                        if (woman === _woman) {
                            woman.destroy();
                            the._women.splice(index, 1);
                            return false;
                        }
                    });
                });
                the._women.push(woman);
            }

            the._women.forEach(function (woman) {
                woman.draw();
            });

            dato.each(the._women, function (index, woman) {
                if (!woman.__touched && the._isTouch(woman)) {
                    woman.__touched = true;
                    the.emit('touch');
                    return false;
                }
            });

            return the;
        },


        /**
         * 判断是否能够画
         * @returns {boolean}
         * @private
         */
        _can: function () {
            var the = this;
            var options = the._options;

            if (!the._women.length) {
                return true;
            }

            if (the._women.length >= options.maxLength) {
                return false;
            }

            // 最后一个 woman
            var lastWoman = the._women[the._women.length - 1];

            return lastWoman.getPosition().top > options.minOffset + the._imgHeight;
        },


        /**
         * 判断两个矩形物体是否碰撞
         * @param woman
         * @returns {boolean}
         * @private
         */
        _isTouch: function (woman) {
            var the = this;
            var pos1 = woman.getPosition();
            var pos2 = the._man;

            // 光线投影法
            //
            //        []
            // ----------------
            return pos1.top + pos1.height > pos2.top && pos1.left > pos2.left && pos1.left < pos2.left + pos2.width;

            // 中心连线法
            //var center1 = {
            //    x: pos1.left + pos1.width / 2,
            //    y: pos1.top + pos1.height / 2
            //};
            //var center2 = {
            //    x: pos2.left + pos2.width / 2,
            //    y: pos2.top + pos2.height / 2
            //};
            //var centerX = pos1.left - pos2.left;
            //var centerY = pos1.top - pos2.top;
            //var getXY = function (x, y) {
            //    return Math.sqrt(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2));
            //};
            //
            //var xy1 = getXY(center1.x - center1.x, center1.y - center2.y);
            //var xy2 = getXY(centerX, centerY);
            //
            //return xy1 <= xy2;
        },


        /**
         * 改变男人位置
         * @returns {Women}
         */
        changeMan: function (posSize) {
            var the = this;

            dato.extend(the._man, posSize);

            return the;
        }
    });

    Women.defaults = defaults;
    module.exports = Women;
});