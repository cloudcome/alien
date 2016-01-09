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

    document.getElementById('getSelection').onclick = function () {
        console.log(textarea.getSelection($textarea));
    };

    document.getElementById('setSelection').onclick = function () {
        var length = $textarea.value.length;
        var middle = length / 2;

        textarea.setSelection($textarea, middle - 1, middle + 1);
    };

    document.getElementById('insert1').onclick = function () {
        textarea.insert($textarea, '[' + Date.now() + ']', true);
    };

    document.getElementById('insert2').onclick = function () {
        textarea.insert($textarea, '[' + Date.now() + ']', true, false);
    };

    document.getElementById('insert3').onclick = function () {
        textarea.insert($textarea, '[' + Date.now() + ']', true, [2, 4]);
    };

    document.getElementById('insert4').onclick = function () {
        textarea.insert($textarea, '[' + Date.now() + ']', [2, 4]);
    };

    document.getElementById('insert5').onclick = function () {
        textarea.insert($textarea, '[' + Date.now() + ']', [2, 4], false);
    };

    document.getElementById('insert6').onclick = function () {
        textarea.insert($textarea, '[' + Date.now() + ']', [2, 4], [2, 4]);
    };

    document.getElementById('getSelectionRect').onclick = function () {
        console.log(textarea.getSelectionRect($textarea));
    };

    window.textarea = textarea;
});