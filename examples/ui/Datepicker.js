/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-02-05 10:55
 */


define(function (require, exports, module) {
    "use strict";
    
    var Datepicker = require('../../src/ui/Datepicker/');
    var dp = new Datepicker();

    document.getElementById('text').onfocus = function(){
        dp.open();
    };
});