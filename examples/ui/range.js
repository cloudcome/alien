/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-15 15:33
 */


define(function (require, exports, module) {
    /**
     * @module parent/Slidebar
     */

    'use strict';

    var Range = require('../../src/ui/range/');
    var random = require('../../src/utils/random.js');
    var $val1 = document.getElementById('val1');
    var $btn1 = document.getElementById('btn1');
    var $val2 = document.getElementById('val2');
    var $btn2 = document.getElementById('btn2');

    var r1 = new Range('#demo1', {
        value: 40,
        step: 10,
        min: 0,
        max: 100
    });
    r1.on('change', function (val) {
        $val1.innerHTML = JSON.stringify(val);
    });

    $btn1.onclick = function () {
        r1.change(random.number(0, 100));
    };

    var r2 = new Range('#demo2', {
        value: [4, 6],
        min: 0,
        max: 10,
        step: 1
    });

    r2.on('change', function (val) {
        $val2.innerHTML = JSON.stringify(val);
    });

    $btn2.onclick = function () {
        r2.change([random.number(0, 10), random.number(0, 10)]);
    };

    var date = new Date();

    var r3 = new Range('#demo3', {
        value: date.getHours(),
        min: 0,
        max: 23,
        step: 1
    });

    var r4 = new Range('#demo4', {
        value: date.getMinutes(),
        min: 0,
        max: 59,
        step: 1
    });

    var r5 = new Range('#demo5', {
        value: date.getSeconds(),
        min: 0,
        max: 59,
        step: 1
    });

    window.setInterval(function () {
        var date = new Date();
        r3.change(date.getHours());
        r4.change(date.getMinutes());
        r5.change(date.getSeconds());
    }, 1000);

    window.onresize = function () {
        r1.update();
        r2.update();
        r3.update();
        r4.update();
        r5.update();
    };
});