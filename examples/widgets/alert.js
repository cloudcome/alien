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

    var alert = require('../../src/widgets/alert.js');

    document.getElementById('btn').onclick = function () {
        alert('自定义消息', {
            buttons: ['自定义按钮']
        });
    };
});