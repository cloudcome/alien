/*!
 * touch.js
 * @author ydr.me
 * @create 2014-09-27 16:07
 */


define(function (require, exports, module) {
    /**
     * 扩展触摸事件支持
     *
     * @module core/event/touch
     * @requires core/event/base
     * @requires core/dom/attribute
     * @requires utils/controller
     *
     * @example
     * event.on(ele, 'touch1start', fn);
     * event.on(ele, 'touch1move', fn);
     * event.on(ele, 'touch1end', fn);
     * event.on(ele, 'touch1cancel', fn);
     * event.on(ele, 'tap', fn);
     * event.on(ele, 'dbltap', fn);
     * event.on(ele, 'taphold', fn);
     * event.on(ele, 'swipe', fn);
     * event.on(ele, 'swipeup', fn);
     * event.on(ele, 'swiperight', fn);
     * event.on(ele, 'swipebottom', fn);
     * event.on(ele, 'swipeleft', fn);
     */
    'use strict';

    // fastclick 会导致无法弹出长按菜单
    var fastclick = require('../../3rd/fastclick.js');

    fastclick.attach(document.body);

    module.exports = require('./base.js');
});