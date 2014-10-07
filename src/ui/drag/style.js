/*!
 * style.js
 * @author ydr.me
 * @create 2014-10-02 16:24
 */


define(function (require) {
    /**
     * @module ui/drag/style
     * @requires core/dom/modification
     */
    'use strict';


    var style =
        '.alien-ui-drag{opacity:.8}' +
        '.alien-ui-drag-clone{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;position:absolute;z-index:999;background:#FEFFF3;border:1px dashed #F3DB7A}';

    var modification = require('../../core/dom/modification.js');

    modification.importStyle(style);
});