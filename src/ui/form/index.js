/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-05 13:49
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var ui = require('../index.js');
    var defaults = {};
    var Form = ui.create({
        constructor: function () {

        }
    });

    Form.defaults = defaults;
    module.exports = Form;
});