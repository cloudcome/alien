/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-22 15:39
 */


define(function (require, exports, module) {
    /**
     * @module parent/Fullpage
     */

    'use strict';

    var Fullpage = require('../../src/ui/Fullpage/');

    new Fullpage('#fullpage', {
        axis: 'y'
    });
});