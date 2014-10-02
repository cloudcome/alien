/*!
 * style.js
 * @author ydr.me
 * @create 2014-10-02 16:24
 */


define(function (require) {
    /**
     * @module ui/drag/style
     */
    'use strict';

    var modification = require('../../core/dom/modification.js');
    var style = '.alien-drag{\
    opacity: .8\
    }\
    .alien-clone{\
    position:absolute;\
    z-index: 999;\
    background: #fff;\
    border:1px dashed #ccc;\
    }';

    modification.style(style);
});