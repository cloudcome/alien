/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-08-26 22:26
 */


define(function (require, exports, module) {
    /**
     * @module parent/touch
     */

    'use strict';

    var $ret = document.getElementById('ret');
    var $demo = document.getElementById('demo');
    var Touch = require('../../src/libs/touch.js');
    var touch = new Touch($demo, {
        preventDefault: true
    });

    touch
        .on('tap', function (eve) {
            $ret.insertAdjacentHTML('beforeend', '<p>tap ' + Date.now() + '</p>');
        })
        .on('dbltap', function (eve) {
            $ret.insertAdjacentHTML('beforeend', '<p>dbltap ' + Date.now() + '</p>');
        })
        .on('taphold', function () {
            $ret.insertAdjacentHTML('beforeend', '<p>taphold ' + Date.now() + '</p>');
        })
        .on('swipe', function (eve) {
            $ret.insertAdjacentHTML('beforeend', '<p>swipe ' + eve.alienDetail.moveDirection + ' ' + Date.now() + '</p>');
        });
});