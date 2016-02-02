/**
 * StackLayout.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This layout uses the browsers layout when the items are blocks.
 *
 * @-x-less StackLayout.less
 * @class tinymce.ui.StackLayout
 * @extends tinymce.ui.FlowLayout
 */
define(function (require, exports, module) {
    var FlowLayout = require("./FlowLayout");
    "use strict";

    return FlowLayout.extend({
        Defaults: {
            containerClass: 'stack-layout',
            controlClass: 'stack-layout-item',
            endClass: 'break'
        },

        isNative: function () {
            return true;
        }
    });
});