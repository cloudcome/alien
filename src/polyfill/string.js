/*!
 * string polyfill
 * @author ydr.me
 * @create 2015-07-15 19:43
 */


define(function (require, exports, module) {
    /**
     * @module polyfill/string
     */

    'use strict';

    // @ref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
    if (!String.prototype.trim) {
        (function() {
            // Make sure we trim BOM and NBSP
            var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
            String.prototype.trim = function() {
                return this.replace(rtrim, '');
            };
        })();
    }
});