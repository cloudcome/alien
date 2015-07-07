/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-07 16:06
 */


define(function (require, exports, module) {
    /**
     * @module parent/tip
     */

    'use strict';

    var tip = require('../../src/widgets/tip.js');
    var random = require('../../src/utils/random.js');

    document.getElementById('btn').onclick = function () {
        tip(random.string(random.number(2, 5), 'aA0'));
    };
});