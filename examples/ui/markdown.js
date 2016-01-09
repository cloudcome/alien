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
        confirm(old.message).on('complete', function (confirmed) {
            accept(confirmed);
        });
    });

    md.updateAtList([{
        text: '瑞哎可特',
        image: 'http://assets.jikexueyuan.com/user/avtar/201509/08/09/1unctk3jcv2g5.jpeg',
        value: 'rect'
    }, {
        text: '溜达页',
        image: 'http://assets.jikexueyuan.com//share/jkxy_public/www/Data/Attachments/user/avtar/2937385.gif',
        value: 'liud312312'
    }, {
        text: '修就的',
        image: 'https://avatars2.githubusercontent.com/u/38180?s=140',
        value: 'xiujiud'
    }, {
        text: 'Integ',
        image: 'https://avatars2.githubusercontent.com/u/1772687?s=140',
        value: 'Integ'
    }, {
        text: '横竖',
        image: 'https://avatars2.githubusercontent.com/u/2787987?s=140',
        value: 'hestnutchen'
    }]);

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