/**
 * Radio.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new radio button.
 *
 * @-x-less Radio.less
 * @class tinymce.ui.Radio
 * @extends tinymce.ui.Checkbox
 */
define(function (require, exports, module) {
    var Checkbox = require("./Checkbox");
    "use strict";

    return Checkbox.extend({
        Defaults: {
            classes: "radio",
            role: "radio"
        }
    });
});