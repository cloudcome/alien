/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-05 14:03
 */


define(function (require, exports, module) {
    'use strict';

    var gid = require('../../../src/core/dom/grid.js');

    var eList1 = document.getElementById('list1');
    var eList2 = document.getElementById('list2');
    var length = 4;
    var start = 0;
    var html = '';
    while (start++ < length) {
        html += '<li>' + start + '</li>';
    }
    eList1.innerHTML = html;
    eList2.innerHTML = html;

    gid.make(eList1, {
        columns: 3,
        itemWidth: 100
    });
    gid.make(eList2, {
        columns: 3,
        itemWidth: 100,
        itemAside: true
    });
});