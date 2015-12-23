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

    var textarea = require('../../src/utils/textarea.js');
    var $textarea = document.getElementById('textarea');

    document.getElementById('position1').onclick = function () {
        console.log(textarea.getPosition($textarea));
    };

    document.getElementById('insert1').onclick = function () {
        textarea.insert($textarea, '[' + Date.now() + ']');
    };
});