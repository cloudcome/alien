/**
 * marked render table
 * @author ydr.me
 * @create 2015-04-18 17:03
 */


define(function (require, exports, module) {
    'use strict';

    var dato = require('../../utils/dato.js');

    var defaults = {
        className: ''
    };

    module.exports = function (options) {
        options = dato.extend({}, defaults, options);

        return function (thead, tbody) {
            return '<table class="' + options.className + '"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';
        };
    };
});