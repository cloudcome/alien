/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-15 15:33
 */


define(function (require, exports, module) {
    /**
     * @module parent/Slidebar
     */

    'use strict';

    var Popup = require('../../src/ui/Popup/');
    var selector = require('../../src/core/dom/selector.js');
    var random = require('../../src/utils/random.js');

    selector.query('button').forEach(function ($btn, index) {
        var pp = new Popup($btn, {
            style: {
                maxWidth: 500
            }
        });


        $btn.onclick = function () {
            pp.setContent('<p style="word-break: break-all;">' +
                random.string(random.number(5, 500), 'aA0') + '。</p>').open();
        };
    });
});