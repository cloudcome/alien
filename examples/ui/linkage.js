/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-04 23:58
 */


define(function (require, exports, module) {
    /**
     * @module parent/linkage
     */

    'use strict';

    var Linkage = require('../../src/ui/linkage/index.js');
    var linkage = new Linkage('#demo', {
        urls: [
            './linkage1.json',
            './linkage2.json',
            './linkage3.json'
        ]
    });

    linkage.on('change', function () {
        console.log(this.values);
    });

    linkage.setValues([2, 33, 222]);

    window.linkage = linkage;
});