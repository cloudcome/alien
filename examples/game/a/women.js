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
        maxLength: 20,
        // 最小间隔 px
        minOffset: 30,
        // 加速度
        acc: 0.0005,
        // 初始速度
        speed: 1,
        // 最大速度
        maxSpeed: 20,
        // 碰撞检测，顶部偏移
        offsetTop: 10
    };
    var Women = klass.extends(Emitter).create({
        constructor: function ($canvas, img, options) {
            var the = this;

            the._$canvas = selector.query($canvas)[0];
            the._context = the._$canvas.getContext('2d');
            the._canvasWidth = the._$canvas.width;
            the._canvasHeight = the._$canvas.height;
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
            the._ratio = 0;
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
                    the._remove(this);
                });
                the._women.push(woman);
            }

            the._context.clearRect(0, 0, the._canvasWidth, the._canvasHeight);
            the._women.forEach(function (woman) {
                woman.draw();
            });

            dato.each(the._women, function (index, woman) {
                if (the._isTouch(woman)) {
                    the._remove(woman);
                    the.emit('touch');
                    return false;
                }
            });

            return the;
        },

        /**
         * 删除指定的 woman
         * @param _woman
         * @private
         */
        _remove: function (_woman) {
            var the = this;

            dato.each(the._women, function (index, woman) {
                if (woman === _woman) {
                    the._options.speed = woman.getSpeed();
                    woman.destroy();
                    the._women.splice(index, 1);
                    return false;
                }
            });
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
            var options = the._options;
            var pos1 = woman.getPosition();
            var pos1Right = pos1.left + pos1.width;
            var pos2 = the._man;
            var pos2Top = pos2.top + options.offsetTop;
            var pos2Right = pos2.left + pos2.width;

            // 光线投影法
            //
            //        []
            // ----------------
            return pos1.top + pos1.height > pos2Top &&
                (
                    pos1.left > pos2.left && pos1.left < pos2Right ||
                    pos1Right > pos2.left && pos1Right < pos2Right
                );

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