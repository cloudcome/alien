/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-06 14:19
 */


define(function (require, exports, module) {
    /**
     * @module parent/alert
     */
    'use strict';

    var prompt = require('../../src/widgets/prompt.js');
    var alert = require('../../src/widgets/alert.js');

    document.getElementById('btn').onclick = function () {
        prompt('输入你的银行卡密码', '123123').on('sure', function (value) {
            alert(value);
        }).on('cancel', function () {
            alert('取消了输入');
        });
    };
});