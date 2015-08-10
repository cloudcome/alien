/*!
 * 上拉与下拉
 * @author ydr.me
 * @create 2015-03-05 16:42
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */
    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var event = require('../../core/event/touch.js');
    var dato = require('../../utils/dato.js');
    var defaults = {
        minY: 30
    };
    var Touchpull = ui.create({
        constructor: function ($parent, $ele, options) {
            var the = this;

            the._$parent = selector.query($parent)[0];
            the._$ele = selector.query($ele)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the.destroyed = false;
            the._initEvent();
        },

        _initEvent: function () {
            var the = this;

            event.on(the._$parent, 'touch1start', function (eve) {

            });
        },

        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
        }
    });
    Touchpull.defaults = defaults;

    module.exports = Touchpull;
});