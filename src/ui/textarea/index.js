/**
 * 文件描述
 * @author ydr.me
 * @create 2015-12-23 17:31
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */

    'use strict';

    var ui = require('../index.js');
    var selector = require('../../core/dom/selector.js');
    var textarea = require('../../utils/textarea.js');
    var dato = require('../../utils/dato.js');

    var defaults = {};

    var Textaera = ui.create({
        constructor: function ($textarea, options) {
            var the = this;

            the._$textarea = selector.query($textarea)[0];
            the._options = dato.extend({}, defaults, options);
        },


    });

    Textaera.defaults = defaults;
    module.exports = Textaera;
});