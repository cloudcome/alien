/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-21 19:05
 */


define(function (require, exports, module) {
    /**
     * @module parent/screen
     */

    'use strict';

    var Screen = require('../../src/ui/screen/index.js');


    document.getElementById('open').onclick = function () {
        sc.open();
    };

    document.getElementById('open2').onclick = function () {
        sc2.open();
    };

    document.getElementById('open3').onclick = function () {
        sc3.open();
    };

    document.getElementById('close').onclick = function () {
        sc.close();
    };

    document.getElementById('close2').onclick = function () {
        sc2.close();
    };

    document.getElementById('close3').onclick = function () {
        sc3.close();
    };

    var sc = new Screen('#demo', {
        addClass: 'screen'
    });
    var sc2 = new Screen('#demo2', {
        modal: true,
        style: {
            top: 'auto'
        }
    });
    var sc3 = new Screen('#demo3', {
        modal: true,
        style: {
            right: '50%',
            transform: 'translate3d(-100%, 0, 0)'
        }
    });
});