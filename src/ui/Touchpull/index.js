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

    var ui = require('../base.js');
    var selector = require('../../core/dom/selector.js');
    var event = require('../../core/event/touch.js');
    var dato = require('../../utils/dato.js');
    var defaults = {
        minY: 30
    }
    var Touchpull = ui.create(function ($parent, $ele, options) {
        var the = this;

        the._$parent = selector.query($parent)[0];
        the._$ele = selector.query($ele)[0];
        the._options = dato.extend(true, {}, defaults, options);
        the._init();
    });

    Touchpull.fn._init = function () {
        var the = this;

        the._initEvent();
    };

    Touchpull.fn._initEvent = function () {
        var the = this;

        event.on(the._$parent, 'touch1start', function (eve) {

        });
    };
});