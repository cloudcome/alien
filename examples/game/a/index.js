/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-23 11:47
 */


define(function (require, exports, module) {
    /**
     * @module parent/a
     */

    'use strict';

    var selector = require('../../../src/core/dom/selector.js');
    var attribute = require('../../../src/core/dom/attribute.js');
    var event = require('../../../src/core/event/touch.js');
    var canvasImg = require('../../../src/canvas/img.js');
    var howdo = require('../../../src/utils/howdo.js');
    var loader = require('../../../src/utils/loader.js');
    var controller = require('../../../src/utils/controller.js');
    var random = require('../../../src/utils/random.js');
    var tips = require('../../../src/widgets/tips.js');
    var Women = require('./women.js');
    var $canvas1 = selector.query('#canvas1')[0];
    var $canvas2 = selector.query('#canvas2')[0];
    var $fps = selector.query('#fps')[0];
    var winWidth = attribute.width(window);
    var winHeight = attribute.height(window);
    var canvasWidth = Math.min(winWidth, 320);
    var canvasHeight = winHeight;
    var context1 = $canvas1.getContext('2d');
    var context2 = $canvas2.getContext('2d');
    var imgs = {
        car: require('./img/car.png', 'image|url'),
        car2: require('./img/car_2.png', 'image|url'),
        women: require('./img/women.png', 'image|url')
    };
    var onready = function () {
        attribute.attr($canvas1, {
            width: canvasWidth,
            height: canvasHeight
        });
        attribute.attr($canvas2, {
            width: canvasWidth,
            height: canvasHeight
        });

        var carImg = imgs.car;
        var carWidth = carImg.width;
        var carHeight = carImg.height;
        var maxLeft = canvasWidth - carWidth;
        var maxTop = canvasHeight - carHeight;
        var left = random.number(0, maxLeft);
        var women = new Women($canvas1, imgs.women);
        var touchLength = 0;

        women.on('touch', function () {
            touchLength++;
            tips('碰到了: ' + touchLength);
        });

        controller.setIntervalFrame(function () {
            context1.clearRect(0, 0, canvasWidth, canvasHeight);
            context2.clearRect(0, 0, canvasWidth, canvasHeight);
            var carImg = imgs.car;
            var carWidth = carImg.width;
            var carHeight = carImg.height;

            women.draw();
            women.changeMan({
                width: carWidth,
                height: carHeight,
                left: left,
                top: maxTop
            });
            canvasImg($canvas2, imgs.car, {
                drawLeft: left,
                drawTop: maxTop
            });
        });
    };

    howdo.each(imgs, function (key, url, done) {
        loader.img(url, function (err) {
            if (err) {
                return done(err);
            }

            imgs[key] = this;
            done();
        });
    }).together().try(function () {
        onready();
    }).catch(function () {
        alert('资源加载失败，刷新重试');
    });

    controller.fps(function (fps) {
        $fps.innerHTML = fps;
    });
});