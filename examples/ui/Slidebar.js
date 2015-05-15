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

    var Slidebar = require('../../src/ui/Slidebar/');
    var random = require('../../src/utils/random.js');
    var s1 = new Slidebar('#demo1', {
        value: 40,
        step: 10
    });
    var $val1 = document.getElementById('val1');
    var $btn1 = document.getElementById('btn1');
    var $val2 = document.getElementById('val2');
    var $btn2 = document.getElementById('btn2');

    s1.on('change', function (val) {
        $val1.innerHTML = JSON.stringify(val);
    });

    $btn1.onclick = function () {
        s1.change(random.number(0, 100));
    };

    var s2 = new Slidebar('#demo2', {
        value: [4, 6],
        min: 0,
        max: 10,
        step: 1
    });

    s2.on('change', function (val) {
        $val2.innerHTML = JSON.stringify(val);
    });
});