/*!
 * event touch click
 * @author ydr.me
 * @create 2014-09-27 16:07
 */


define(function (require, exports, module) {
    /**
     * 扩展触摸事件支持
     *
     * @module core/event/touch
     * @requires core/event/base
     */
    'use strict';

    var fastclick = require('../../3rd/fastclick.js');

    fastclick.attach(document.body);

    module.exports = require('./base.js');
});