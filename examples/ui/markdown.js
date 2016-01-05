/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-23 14:44
 */


define(function (require, exports, module) {
    /**
     * @module parent/markdown
     */

    'use strict';

    var Markdown = require('../../src/ui/markdown/index.js');

    var md = new Markdown('#demo');

    md.on('upload', function (eve, file, done) {
        setTimeout(function () {
            done({
                url: 'http://p18.qhimg.com/t0144d6a0802f22be4f.jpg',
                width: 480,
                height: 360
            });
        });
    });
});