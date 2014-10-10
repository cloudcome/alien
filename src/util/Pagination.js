/*!
 * Pagination.js
 * @author ydr.me
 * @create 2014-10-09 18:36
 */


define(function (require, exports, module) {
    /**
     * @module util/Pagination
     */
    'use strict';

    var data = require('./data.js');
    var klass = require('./class.js');
    var defaults = {};
    var Pagination = klass.create({
        STATIC: {
            defaults: defaults
        },
        constructor: function (options) {

        },
        _init: function () {

        }
    });

    module.exports = function (options) {
        return (new Pagination(data.extend(!0, {}, defaults, options)))._init();
    }
});