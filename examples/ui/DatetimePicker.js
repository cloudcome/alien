/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-02-05 10:55
 */


define(function (require, exports, module) {
    "use strict";
    
    var DatetimePicker = require('../../src/ui/DatetimePicker/');

    //new DatetimePicker('#text1');
    new DatetimePicker('#text2', {
        format: 'YYYY-MM-DD HH:mm:ss'
    });
});