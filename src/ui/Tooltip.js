/*!
 * Tooltip.js
 * @author ydr.me
 * @create 2014-10-16 21:41
 */


define(function (require, exports, module) {
    /**
     * @module ui/Tooltip
     * @requires util/class
     * @requires util/data
     * @requires libs/Emitter
     * @requires core/dom/selector
     */
    'use strict';

    var klass = require('../util/class.js');
    var data = require('../util/data.js');
    var Emitter = require('../libs/Emitter.js');
    var selector = require('../core/dom/selector.js');
    var index = 1;
    var defaults= {};
    var Tooltip = klass.create({
        STATIC:{
            defaults: defaults
        },

        constructor: function (ele, options) {
            var the = this;


            the._ele = selector.query(ele);

            if (!the._ele.length) {
                throw new Error('instance element is empty');
            }

            the._ele = the._ele[0];
            Emitter.apply(the, arguments);
            the._options = data.extend(!0, {}, defaults, options);
            the._id = index++;
            the._init();
        },


        _init: function () {

        }
    });


    module.exports = Tooltip;
});