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

    var confirm = require('../../src/widgets/confirm.js');
    var alert = require('../../src/widgets/alert.js');

    document.getElementById('btn').onclick = function () {
        confirm('自定义消息', {
            buttons: ['好的', '不要']
        }).on('sure', function () {
            alert('好的啦');
        }).on('cancel', function () {
            alert('不要嘛');
        });
    };
});