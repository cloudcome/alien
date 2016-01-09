/**
 * marked render table
 * @author ydr.me
 * @create 2015-04-18 17:03
 */


define(function (require, exports, module) {
    'use strict';

    var className = 'table table-radius table-bordered table-hover';

    module.exports = function (thead, tbody) {
        return '<table class="' + className + '"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';
    };
});