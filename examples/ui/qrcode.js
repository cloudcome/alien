/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-01 14:47
 */


define(function (require, exports, module) {
    /**
     * @module parent/qrcode
     */

    'use strict';

    var Qrcode = require('../../src/ui/qrcode/index.js');

    var qrcode = new Qrcode('#demo', {
        type: 'svg'
    });

    document.getElementById('submit').onclick = function () {
        qrcode.render(document.getElementById('text').value);
    };
});