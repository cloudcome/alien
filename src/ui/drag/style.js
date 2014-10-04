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

    var style = function () {
        /***
         .alien-ui-drag{
            opacity: .8;
         }

         .alien-ui-drag-clone{
            position: absolute;
            z-index: 999;
            background: #fff;
            border: 1px dashed #ccc;
         }
         */
    };
    var modification = require('../../core/dom/modification.js');

    modification.style(style.toString().match(/\/\*{3}([\s\S]*)\*\//)[1]);
});