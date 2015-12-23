/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-23 16:43
 */


define(function (require, exports, module) {
    /**
     * @module parent/textarea
     */

    'use strict';

    var Textarea = require('../../src/ui/textarea/index.js');

    var ta = new Textarea('#textarea');

    window.ta = ta;

    ta.on('change', function (info) {
        console.log(info);
    });
});