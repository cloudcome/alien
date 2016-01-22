/**
 * insert line
 * @author ydr.me
 * @create 2015-12-29 17:45
 */


define(function (require, exports, module) {
    'use strict';

    var klass = require('../../../../utils/class.js');
    var dato = require('../../../../utils/dato.js');

    var defaults = {};

    module.exports = klass.create({
        constructor: function (editor, options) {
            var the = this;

            the.editor = editor;
            the._options = dato.extend({}, defaults, options);
        },

        exec: function () {
            this.editor.insert('hr');
            this.editor.insertHTML('<p><br></p>');
        },

        /**
         * 销毁实例
         */
        destroy: function () {
            // ignore
        }
    });
});