/*!
 * ui/Slidebar
 * @author ydr.me
 * @create 2015-05-15 15:01
 */


define(function (require, exports, module) {
    /**
     * @module ui/Slidebar/
     */

    'use strict';

    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var Template = require('../../libs/Template.js');
    var tpl = new Template(template);
    var modification = require('../../core/dom/modification.js');
    var selector = require('../../core/dom/selector.js');
    var event = require('../../core/event/base.js');
    var defaults = {
        // 方向，horizontal OR vertical
        orientation: 'horizontal',
        step: 1,
        min: 1,
        max: 100,
        // 数组：---o--------o----
        // 单值：------------o----
        value: 0,
        // 滑动范围：
        // max：0-max
        range: 'max'
    };
});