/*!
 * index.js
 * @author ydr.me
 * @create 2014-10-06 16:11
 */


define(function (require, exports, module) {
    /**
     * @module ui/scrollbar/index
     */
    'use strict';

    var defaults = {};
    var data = require('../../util/data.js');
    var klass = require('../../util/class.js');
    var Scrollbar = klass.create({
        constructor: function (ele, options) {
            this.ele = ele;
            this.options = options;
        },
        _init: function () {
            var the = this;
            var options = the.options;

            if(the.ele && the.ele.nodeName !=='DIV'){
                throw new Error('please instance alien/ui/scrollbar on DIV');
            }

        },
        destroy: function () {

        }
    });

    module.exports = function (ele, options) {
        options = data.extend(!0, {}, defaults, options);

        return (new Scrollbar(ele, options))._init();
    };
});