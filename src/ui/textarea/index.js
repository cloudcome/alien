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
    var event = require('../../core/event/hotkey.js');
    var textarea = require('../../utils/textarea.js');
    var dato = require('../../utils/dato.js');

    var defaults = {
        tabSize: 4,
        historyLength: 99
    };

    var Textaera = ui.create({
        constructor: function ($textarea, options) {
            var the = this;

            the._$textarea = selector.query($textarea)[0];
            the._options = dato.extend({}, defaults, options);
            the._stack = [];
            the._initEvent();
        },

        _initEvent: function () {
            var the = this;
            var $textarea = the._$textarea;

            event.on($textarea, 'tab', function () {
                var selection = textarea.getSelection($textarea);



                return false;
            });
        },


        /**
         * 设置值
         * @param start
         * @param end
         * @param value
         * @private
         */
        _set: function (start, end, value) {
            var the = this;

            the._$textarea = value;
            the._stack.unshift({
                s: start,
                e: end,
                v: value
            });
            textarea.setSelection(the._$textarea, start, end);

            while (the._stack.length > the._options.historyLength) {
                the._stack.pop();
            }
        }
    });

    Textaera.defaults = defaults;
    module.exports = Textaera;
});