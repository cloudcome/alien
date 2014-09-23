/*!
 * xhr.js
 * @author ydr.me
 * 2014-09-23 22:14
 */


define(function (require, exports, module) {
    /**
     * @module parent/child.js
     */
    'use strict';

    var data = require('../../util/data.js');
    var noop = function () {

    };
    var defaults = {
        url: location.href,
        method: 'GET',
        dataType: 'json',
        query: null,
        data: null,
        headers: null,
        onload: noop,
        onerror: noop
    };

    module.exports = {
        ajax: function ajax(options){
            options = data.extend(!0, {}, defaults, options);

            var xhr = new XMLHttpRequest();

            xhr.onload = function () {

            };

            xhr.onerror = function () {

            };

            return xhr;
        }
    };
});