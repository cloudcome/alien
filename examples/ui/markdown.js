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
    var confirm = require('../../src/widgets/confirm.js');

    var md = new Markdown('#demo');

    md.on('different', function (old, accept) {
        confirm(''.concat(
            '当前有编辑器有之前未保存的历史记录，是否恢复？摘要如下：<br>',
            old.start,
            '...',
            old.end + '<br>',
            '共' + old.length + '字<br>'
        )).on('complete', function (accepted) {
            accept(accepted);
        });
    });

    md.on('upload', function (eve, file, done) {
        setTimeout(function () {
            done({
                url: 'http://p18.qhimg.com/t0144d6a0802f22be4f.jpg',
                width: 480,
                height: 360,
                title: 'a handsome cat'
            });
        });
    });
});