/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-10 17:06
 */


define(function (require, exports, module) {
    'use strict';

    var calendar = require('/src/util/calendar.js');
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var group = calendar.month(year, month);

    document.getElementById('pre').innerHTML = JSON.stringify(group, null, 4);
});