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
    var howdo = require('../../../src/utils/howdo.js');
    var loader = require('../../../src/utils/loader.js');
    var controller = require('../../../src/utils/controller.js');
    var random = require('../../../src/utils/random.js');
    //var tips = require('../../../src/widgets/tips.js');
    var Man = require('./man.js');
    var Women = require('./women.js');
    var $canvas1 = selector.query('#canvas1')[0];
    var $canvas2 = selector.query('#canvas2')[0];
    var $fps = selector.query('#fps')[0];
    var $score = selector.query('#score')[0];
    var winWidth = attribute.width(window);
    var winHeight = attribute.height(window);
    var canvasWidth = Math.min(winWidth, 320);
    var canvasHeight = winHeight;
    var canvasLeft = (winWidth - canvasWidth) / 2;
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
        attribute.css($canvas1, {
            left: canvasLeft
        });

        event.on(document, 'touchstart', function () {
            return false;
        });

        var women = new Women($canvas1, imgs.women);
        var touchLength = 0;
        var man = new Man($canvas2, imgs.car, {});

        man.on('change', function (pos) {
            women.changeMan(pos);
        });

        women.on('touch', function () {
            touchLength++;
            $score.innerHTML = touchLength;
        });

        women.start();
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