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
    var f = new Fullpage('#fullpage', {
        axis: ['x', 'y']
    });

    f.on('beforeleave', function (index) {
        console.log(this.alienEmitter.type, index);
    });

    f.on('beforeenter', function (index) {
        console.log(this.alienEmitter.type, index);
    });

    f.on('afterleave', function (index) {
        console.log(this.alienEmitter.type, index);
    });

    f.on('afterenter', function (index) {
        console.log(this.alienEmitter.type, index);
    });
});