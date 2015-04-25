/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-22 17:58
 */


define(function (require, exports, module) {
    /**
     * @module core/event/scroll
     */
    'use strict';

    var event = require('./base.js');

    event.on(document, 'scroll', function (eve) {
        console.log(eve.target);
    });

    module.exports = event;
});