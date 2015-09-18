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

    var tips = require('../../src/widgets/tips.js');
    var controller = require('../../src/utils/controller.js');

    document.getElementById('btn').onclick = function () {
        tips('自定义消息');
    };
    document.getElementById('ipt').onkeydown = function (e) {
        if(e.which === 13){
            this.blur();
            controller.nextFrame(function () {
                tips('自定义消息');
            });
        }
    };
});