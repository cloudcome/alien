/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-12-17 22:13
 */


define(function (require, exports, module) {
    'use strict';

    var Window = require('/src/ui/window/');
    var random = require('/src/utils/random.js');
    var animation = require('/src/core/dom/animation.js');
    var see = require('/src/core/dom/see.js');
    var attribute = require('/src/core/dom/attribute.js');
    var win1;

    document.getElementById('btn1').onclick = function () {
        console.log('...');
        win1.open();
    };

    document.getElementById('btn2').onclick = function () {
        win1.close();
    };

    document.getElementById('btn3').onclick = function () {
        win1.resize({
            width: random.number(50, 300),
            height: random.number(50, 300)
        });
    };

    win1 = new Window('#demo', {
        addClass: 'hehhhhh',
        width: 300,
        height: 3000
        //    open: function ($window, to, onopen) {
        //        to.bottom = -to.height;
        //        attribute.css($window, to);
        //        animation.animate($window, {
        //            bottom: 0
        //        }, {
        //            duration: 456
        //        }, onopen);
        //    }
    });
});