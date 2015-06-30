/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-12-17 22:13
 */


define(function (require, exports, module) {
    'use strict';

    var Pager = require('/src/ui/Pager/index.js');
    var pager = new Pager('#demo', {
        page: 1,
        max: 4
    }).on('change', function (page) {
        this.render({
            page: page
        });
    });
});