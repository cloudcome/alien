/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-16 14:41
 */


define(function (require, exports, module) {
    'use strict';

    var Validator = require('/src/ui/Validator/');
    var v1 = new Validator('#form');
    var $submit = document.getElementById('submit');

    v1.on('validatebefore', function ($ele) {
        $submit.disabled = true;
    });

    v1.on('validateafter', function ($ele) {
        $submit.disabled = false;
    });

    $submit.onclick = function (eve) {
        v1.validateAll();

        eve.preventDefault();
    };
});